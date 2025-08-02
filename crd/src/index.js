const k8s = require("@kubernetes/client-node");
const axios = require("axios");

class DummySiteController {
  constructor() {
    this.kc = new k8s.KubeConfig();
    this.kc.loadFromCluster();

    this.k8sApi = this.kc.makeApiClient(k8s.CoreV1Api);
    this.k8sAppsApi = this.kc.makeApiClient(k8s.AppsV1Api);
    this.k8sCustomApi = this.kc.makeApiClient(k8s.CustomObjectsApi);

    this.namespace = process.env.NAMESPACE || "default";
  }

  async start() {
    console.log("Starting DummySite Controller...");

    try {
      await this.watchDummySites();
    } catch (error) {
      console.error("Error starting controller:", error);
      process.exit(1);
    }
  }

  async watchDummySites() {
    console.log("Watching for DummySite resources...");

    const watch = new k8s.Watch(this.kc);

    watch.watch(
      "/apis/stable.dwk/v1/dummysites",
      { allowWatchBookmarks: true },
      (type, apiObj, watchObj) => {
        console.log(`Event: ${type} for DummySite: ${apiObj.metadata.name}`);

        if (type === "ADDED" || type === "MODIFIED") {
          this.handleDummySite(apiObj);
        } else if (type === "DELETED") {
          this.handleDummySiteDelete(apiObj);
        }
      },
      (err) => {
        console.error("Watch error:", err);
        // Restart watching after error
        setTimeout(() => this.watchDummySites(), 5000);
      }
    );
  }

  async handleDummySite(dummySite) {
    const name = dummySite.metadata.name;
    const namespace = dummySite.metadata.namespace || this.namespace;
    const websiteUrl = dummySite.spec.website_url;

    console.log(`Processing DummySite '${name}' with URL: ${websiteUrl}`);

    try {
      // Fetch HTML content
      const htmlContent = await this.fetchWebsiteContent(websiteUrl);

      // Create ConfigMap with HTML content
      await this.createConfigMap(name, namespace, htmlContent, websiteUrl);

      // Create Deployment
      await this.createDeployment(name, namespace);

      // Create Service
      await this.createService(name, namespace);

      console.log(`Successfully created resources for DummySite '${name}'`);
    } catch (error) {
      console.error(`Error processing DummySite '${name}':`, error.message);
    }
  }

  async fetchWebsiteContent(url) {
    console.log(`Fetching content from: ${url}`);

    try {
      const response = await axios.get(url, {
        timeout: 30000,
        headers: {
          "User-Agent": "DummySite-Controller/1.0",
        },
      });

      return response.data;
    } catch (error) {
      console.error(`Failed to fetch ${url}:`, error.message);
      // Return a simple error page
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Error - DummySite</title>
        </head>
        <body>
          <h1>Error Loading Website</h1>
          <p>Failed to load: ${url}</p>
          <p>Error: ${error.message}</p>
        </body>
        </html>
      `;
    }
  }

  async createConfigMap(name, namespace, htmlContent, originalUrl) {
    const configMapName = `${name}-html`;

    const configMap = {
      apiVersion: "v1",
      kind: "ConfigMap",
      metadata: {
        name: configMapName,
        namespace: namespace,
        labels: {
          app: name,
          dummysite: name,
        },
      },
      data: {
        "index.html": htmlContent,
        "original-url": originalUrl,
      },
    };

    try {
      await this.k8sApi.createNamespacedConfigMap(namespace, configMap);
      console.log(`Created ConfigMap: ${configMapName}`);
    } catch (error) {
      if (error.response?.statusCode === 409) {
        // ConfigMap exists, update it
        await this.k8sApi.replaceNamespacedConfigMap(
          configMapName,
          namespace,
          configMap
        );
        console.log(`Updated ConfigMap: ${configMapName}`);
      } else {
        throw error;
      }
    }
  }

  async createDeployment(name, namespace) {
    const deploymentName = `${name}-deployment`;

    const deployment = {
      apiVersion: "apps/v1",
      kind: "Deployment",
      metadata: {
        name: deploymentName,
        namespace: namespace,
        labels: {
          app: name,
          dummysite: name,
        },
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: {
            app: name,
          },
        },
        template: {
          metadata: {
            labels: {
              app: name,
              dummysite: name,
            },
          },
          spec: {
            containers: [
              {
                name: "nginx",
                image: "nginx:alpine",
                ports: [
                  {
                    containerPort: 80,
                  },
                ],
                volumeMounts: [
                  {
                    name: "html-content",
                    mountPath: "/usr/share/nginx/html",
                    readOnly: true,
                  },
                ],
                resources: {
                  requests: {
                    memory: "32Mi",
                    cpu: "10m",
                  },
                  limits: {
                    memory: "64Mi",
                    cpu: "50m",
                  },
                },
              },
            ],
            volumes: [
              {
                name: "html-content",
                configMap: {
                  name: `${name}-html`,
                },
              },
            ],
          },
        },
      },
    };

    try {
      await this.k8sAppsApi.createNamespacedDeployment(namespace, deployment);
      console.log(`Created Deployment: ${deploymentName}`);
    } catch (error) {
      if (error.response?.statusCode === 409) {
        // Deployment exists, update it
        await this.k8sAppsApi.replaceNamespacedDeployment(
          deploymentName,
          namespace,
          deployment
        );
        console.log(`Updated Deployment: ${deploymentName}`);
      } else {
        throw error;
      }
    }
  }

  async createService(name, namespace) {
    const serviceName = `${name}-service`;

    const service = {
      apiVersion: "v1",
      kind: "Service",
      metadata: {
        name: serviceName,
        namespace: namespace,
        labels: {
          app: name,
          dummysite: name,
        },
      },
      spec: {
        selector: {
          app: name,
        },
        ports: [
          {
            port: 80,
            targetPort: 80,
            protocol: "TCP",
          },
        ],
        type: "ClusterIP",
      },
    };

    try {
      await this.k8sApi.createNamespacedService(namespace, service);
      console.log(`Created Service: ${serviceName}`);
    } catch (error) {
      if (error.response?.statusCode === 409) {
        // Service exists, update it
        await this.k8sApi.replaceNamespacedService(
          serviceName,
          namespace,
          service
        );
        console.log(`Updated Service: ${serviceName}`);
      } else {
        throw error;
      }
    }
  }

  async handleDummySiteDelete(dummySite) {
    const name = dummySite.metadata.name;
    const namespace = dummySite.metadata.namespace || this.namespace;

    console.log(`Cleaning up resources for deleted DummySite: ${name}`);

    try {
      // Delete Service
      await this.k8sApi.deleteNamespacedService(`${name}-service`, namespace);
      console.log(`Deleted Service: ${name}-service`);
    } catch (error) {
      console.log(`Service ${name}-service not found or already deleted`);
    }

    try {
      // Delete Deployment
      await this.k8sAppsApi.deleteNamespacedDeployment(
        `${name}-deployment`,
        namespace
      );
      console.log(`Deleted Deployment: ${name}-deployment`);
    } catch (error) {
      console.log(`Deployment ${name}-deployment not found or already deleted`);
    }

    try {
      // Delete ConfigMap
      await this.k8sApi.deleteNamespacedConfigMap(`${name}-html`, namespace);
      console.log(`Deleted ConfigMap: ${name}-html`);
    } catch (error) {
      console.log(`ConfigMap ${name}-html not found or already deleted`);
    }
  }
}

// Start the controller
const controller = new DummySiteController();
controller.start().catch(console.error);
