# @codingpixel/create-react

A CLI tool to scaffold production-ready React projects with Vite, TypeScript, Redux Toolkit, Tailwind CSS v4, and a complete UI component library.

## Usage

```bash
# Using npx (recommended)
npx @codingpixel/create-react my-app

# Using npm init
npm init @codingpixel/react my-app
```

## Features

The generated project includes:

- **React 19** with TypeScript 5
- **Vite 7** with Fast Refresh
- **React Router v7** for client-side routing
- **Redux Toolkit** + redux-persist for state management
- **Tailwind CSS v4** + SCSS modules for styling
- **Formik + Yup** for form validation
- **Axios** with automatic token refresh
- **17+ UI Components** ready to use

## Project Naming Rules

- Spaces are automatically replaced with dashes (e.g., `my app` → `my-app`)
- Special characters are removed
- Name must be at least **3 characters** long

## Generated Project Structure

```
my-app/
├── src/
│   ├── pages/           # Page components
│   ├── shared/          # Shared components & utilities
│   ├── App.tsx          # Root with routing
│   ├── main.tsx         # App entry
│   └── index.css        # Global styles
├── public/              # Static assets
├── .env.sample          # Environment template
├── README.md            # Project documentation
└── package.json
```

## What's Included

### UI Components
- **Layout**: Accordion, Modal, Tabs, Pagination
- **Forms**: Button, Input, TextArea, Checkbox, ToggleSwitch, PhoneInput, FileUpload, Dropdown
- **Feedback**: Alert, Badge, Tooltip, Spinner, NoContentCard, Toast

### Pages
- Home (component showcase)
- Login (with form validation)
- Dashboard (protected route)

### Infrastructure
- Centralized route configuration
- Dark/light theme system
- Protected routes with authentication
- API client with token refresh
- Form validation schemas

## After Creation

```bash
cd my-app
npm install
cp .env.sample .env
npm run dev
```

## Requirements

- Node.js >= 18.0.0
- Git

## License

MIT

## Repository

https://github.com/codingpixel-developer/react-template
