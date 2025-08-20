# CHESS Admin Interface

A separate React application for managing the CHESS database. This admin interface provides a clean, dedicated environment for database management tasks.

## Features

- **Dashboard**: Overview of database statistics and system status
- **Data Management**: CRUD operations for organisms, assemblies, genes, and annotations
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Built with Bootstrap 5 and Font Awesome icons
- **SSH Tunnel Ready**: Designed to run securely over SSH tunnel without public access

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **UI Framework**: Bootstrap 5
- **Icons**: Font Awesome
- **Package Manager**: Yarn

## Quick Start

### Prerequisites

- Node.js 18+ 
- Yarn package manager

### Installation

1. **Install dependencies**:
   ```bash
   cd CHESSApp_frontend_admin
   yarn install
   ```

2. **Start development server**:
   ```bash
   yarn dev
   ```

3. **Access the admin interface**:
   - Open your browser and navigate to `http://localhost:3001`
   - No login required - runs over SSH tunnel

### Build for Production

```bash
yarn build
```

The built files will be in the `dist` directory.

## Project Structure

```
CHESSApp_frontend_admin/
├── src/
│   ├── components/
│   │   └── Header.tsx              # Navigation header
│   ├── pages/
│   │   ├── Login.tsx               # Authentication page
│   │   ├── Dashboard.tsx           # Main dashboard
│   │   └── OrganismsManagement.tsx # Example CRUD page
│   ├── redux/
│   │   ├── auth/
│   │   │   └── authSlice.ts        # Authentication state
│   │   ├── store.ts                # Redux store configuration
│   │   └── rootReducer.ts          # Root reducer
│   ├── App.tsx                     # Main app component
│   ├── App.css                     # App-specific styles
│   └── main.tsx                    # Application entry point
├── index.html                      # HTML template
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Vite configuration
└── README.md                       # This file
```

## Configuration

### Port Configuration

The admin app runs on port 3001 by default (different from the main CHESS app). You can change this in `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001, // Change this to your preferred port
    host: true
  },
  // ...
});
```

### Backend API Configuration

Currently, the app uses mock data. To connect to your backend:

1. Update API endpoints in the respective components
2. Replace mock data with actual API calls
3. Configure CORS if needed

Example API integration:
```typescript
const fetchOrganisms = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/admin/organisms');
    const data = await response.json();
    setOrganisms(data);
  } catch (error) {
    setError('Failed to fetch organisms');
  }
};
```

## Security

The admin interface is designed to run over SSH tunnel without public access. Authentication has been removed for this deployment model.

**Note**: This configuration is suitable for secure internal deployments where access is controlled via SSH tunneling.

## Adding New Management Pages

1. **Create a new page component** in `src/pages/`:
   ```typescript
   // src/pages/NewEntityManagement.tsx
   import React from 'react';
   
   const NewEntityManagement: React.FC = () => {
     return (
       <div className="container-fluid">
         <h2>New Entity Management</h2>
         {/* Your content here */}
       </div>
     );
   };
   
   export default NewEntityManagement;
   ```

2. **Add the route** in `src/main.tsx`:
   ```typescript
   const routes = [
     {
       path: "/",
       element: <App />,
       children: [
         // ... existing routes
         { path: 'new-entity', element: <NewEntityManagement /> },
       ],
     }
   ];
   ```

3. **Add navigation link** in `src/components/Header.tsx`:
   ```typescript
   <li><Link className="nav-link" to="/new-entity">New Entity</Link></li>
   ```

## Development

### Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn lint` - Run ESLint

### Code Style

- Use TypeScript for all components
- Follow React functional component patterns
- Use Redux Toolkit for state management
- Implement proper error handling
- Add loading states for async operations

### State Management

The app uses Redux Toolkit for state management:

- **Auth State**: User authentication and session data
- **Future States**: Add more slices as needed for different features

## Security Considerations

1. **Authentication**: Implement proper authentication (JWT, session-based, etc.)
2. **Authorization**: Add role-based access control
3. **Input Validation**: Validate all user inputs
4. **CSRF Protection**: Implement CSRF tokens
5. **Rate Limiting**: Add rate limiting for admin endpoints
6. **Audit Logging**: Log all admin actions

## Deployment

### Production Build

1. Build the application:
   ```bash
   yarn build
   ```

2. Serve the `dist` directory with your web server

### Environment Variables

Create a `.env` file for environment-specific configuration:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_TITLE=CHESS Admin
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change the port in `vite.config.ts`
2. **CORS errors**: Configure your backend to allow requests from the admin app
3. **Authentication issues**: Check Redux store and session management
4. **Build errors**: Ensure all dependencies are installed

### Debug Mode

Enable debug logging in development:

```typescript
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Debug info:', data);
}
```

## Contributing

1. Follow the existing code structure
2. Add proper TypeScript types
3. Include error handling
4. Test your changes thoroughly
5. Update documentation as needed

## Support

For issues or questions about the admin interface, please refer to the main CHESS documentation or contact the development team.

## License

This project follows the same license as the main CHESS application. 