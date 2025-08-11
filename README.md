# IndieLoopStudio - Handcrafted E-commerce Platform

## Overview

IndieLoopStudio is a full-stack e-commerce application designed to connect customers with artisans. The platform allows customers to browse and purchase handcrafted products from around the world, supporting makers while providing an authentic shopping experience. The application features product browsing with filtering capabilities, user authentication, shopping cart functionality, order management, and customer support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and better developer experience
- **Routing**: Wouter for lightweight client-side routing without the overhead of React Router
- **State Management**: React Query (@tanstack/react-query) for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui for consistent, accessible component library
- **Styling**: Tailwind CSS with custom design tokens for craft-themed colors and typography
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express framework for RESTful API endpoints
- **Language**: TypeScript for end-to-end type safety
- **Database ORM**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Session Management**: In-memory session storage with bearer token authentication
- **Data Storage**: Currently using in-memory storage with planned PostgreSQL integration
- **Email**: Configured email service for customer support (development mode logs to console)

### Database Design
- **Users**: Authentication and profile management with username/email login
- **Products**: Complete product catalog with images, pricing, materials, and origin country
- **Reviews**: Customer review system with ratings and comments
- **Orders**: Order tracking with status updates and item details
- **Cart**: Persistent shopping cart tied to user sessions
- **Support Messages**: Customer service communication system

### Authentication & Authorization
- **Strategy**: Session-based authentication with bearer tokens
- **Storage**: localStorage for client-side session persistence
- **Protection**: Route-level authentication guards for protected resources
- **Future**: Extensible authentication system designed for OAuth integration (Google, Meta)

### API Architecture
- **Pattern**: RESTful API design with consistent endpoint structure
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Validation**: Zod schemas shared between client and server for type safety
- **Middleware**: Request logging and session validation middleware

### Frontend Features
- **Product Display**: Grid and list view modes with image slideshows
- **Filtering**: Country and material-based product filtering with search
- **Currency Support**: Multi-currency display (INR, USD, EUR, AED) with conversion
- **Responsive Design**: Mobile-first responsive design with Tailwind CSS
- **Toast Notifications**: User feedback system for actions and errors

## External Dependencies

### Core Technologies
- **Database**: PostgreSQL via Neon Database (@neondatabase/serverless)
- **ORM**: Drizzle ORM for type-safe database operations
- **Email Service**: Configured for SMTP-based email delivery (currently development mode)
- **Session Storage**: PostgreSQL session store (connect-pg-simple) for production

### UI & Design
- **Component Library**: Radix UI primitives for accessible, unstyled components
- **Icons**: Lucide React for consistent iconography
- **Fonts**: Google Fonts (Playfair Display for headings, Inter for body text)
- **Styling**: Tailwind CSS with custom color palette for crafted aesthetic

### Development Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Code Quality**: ESLint and TypeScript for code consistency
- **Development**: Hot module replacement and error overlays for better DX
- **Deployment**: Replit-optimized configuration with banner integration

### Payment Integration
- **Status**: Planned for future implementation
- **Considerations**: Stripe or PayPal integration for secure payment processing

### File Storage
- **Current**: URL-based image references stored in database
- **Future**: Cloud storage integration (AWS S3, Cloudinary) for product images

### Analytics & Monitoring
- **Status**: Not currently implemented
- **Future**: Application performance monitoring and user analytics integration