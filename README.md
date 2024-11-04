# Github Action Logs Workflows [EN]

**Description**  
This application allows you to view GitHub workflows based on their execution status in real-time. It connects to the GitHub API and uses GitHub SSO to authenticate users. Workflows can be displayed with the following statuses:

- **Running**
- **Cancelled**
- **Failure**
- **Success**

The application also enables downloading logs associated with each workflow, making it easier to track and debug.

## Features

- **GitHub Workflow Visualization**: Displays GitHub workflows with their current status.
- **Status Filtering**: Displays workflows based on a specific status (running, cancelled, failure, success).
- **Log Downloading**: Allows users to download logs for each workflow directly from the interface.
- **GitHub SSO Authentication**: Secure authentication through GitHub SSO to access workflow data.

## Requirements

To use this application, you need your **GitHub credentials** (personal token or client ID/client secret for OAuth). These are necessary to authorize requests to the GitHub API.

## Installation

### Technical Requirements

- **Node.js** (version >= 20)
- **npm** (or **yarn**)
- **GitHub Credentials**: Create an OAuth application in your GitHub account to obtain the required credentials (client ID and secret).

### Application Setup

1. Clone the repository to your local environment:

   ```bash
   git clone https://github.com/your_username/your_application.git
   cd your_application
   ```

2. Install the dependencies:

   ```bash
   yarn install
   ```

3. Create a `.env.local` file in the root of your project to store your GitHub credentials:

   ```plaintext
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   ```

   Replace `your_client_id` and `your_client_secret` with your GitHub credentials.

### Starting the Application

1. Start the application with the following command:

   ```bash
   yarn dev
   ```

2. The application will be available at `http://localhost:3000`.

## Usage

1. Access `http://localhost:3000` in your browser.
2. Log in via GitHub SSO to authorize access to workflow data.
3. The main page displays the GitHub workflows associated with your account or organization.
4. Use filters to display only the workflows based on their current status.
5. For each workflow, click the "Download Logs" button to obtain a file with the workflow logs.

## Architecture

The application is built with the following technologies:

- **Framework**: Next.js 15 with App Router for advanced routing and authentication management.
- **Authentication**: GitHub SSO via OAuth for secure login.
- **API**: Integration with the GitHub API to retrieve real-time workflow data.

## Contribution

1. Fork the project.
2. Create a new branch for your changes (`git checkout -b feature/my-feature`).
3. Commit your changes (`git commit -m 'Add a new feature'`).
4. Push to the branch (`git push origin feature/my-feature`).
5. Create a Pull Request.

## Authors

- **Developer's Name** - Main Developer
- **Contributors' Names** - Any additional contributors

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

This README provides clear documentation for users wishing to install and use the application with Next.js, GitHub SSO, and the GitHub API for managing workflows.