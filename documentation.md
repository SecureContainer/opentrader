OpenTrader Client Package Documentation
📦 Package Overview

This package includes the complete source code for OpenTrader. It allows you to build and run the application locally, with the option to create encrypted bundles for distribution.

🚀 Quick Start
1. Install Dependencies

To get started, you need to install the project dependencies:

pnpm install

2. Set Up Environment

First, create your environment configuration by copying the example file:

copy .env.example .env


Next, open the .env file and update it with your specific settings:

# Example environment variables
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD=your_password

3. Build the Application

Once your environment is set up, build the application using tsup:

cd app
npx tsup

4. Run the Application

To start the application, follow these steps:

Set the Admin Password
Set the admin password by running the following command:

node app/dist/cli.mjs set-password your_password


Start the Application
Finally, start the application with:

node app/dist/cli.mjs up 
or 
node app/dist/cli.mjs  


You can also run other components individually, depending on your use case:

node app/dist/daemon.mjs
node app/dist/main.mjs
node app/dist/standalone.mjs