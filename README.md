# Modern Task Management Application

A simple task management application built with Next.js 15, demonstrating modern web development practices, state management patterns, and interactive UI design. This project showcases professional-grade React development with TypeScript, featuring drag-and-drop capabilities, persistent storage, and comprehensive testing.

## 🚀 Technical Highlights

This project demonstrates expertise in modern web development through:

- **Next.js 15**: Leveraging the latest features of Next.js for optimal performance and developer experience
- **TypeScript**: Full type safety across the entire application
- **Zustand**: State management with persistence
- **Drag and Drop**: Intuitive task management using @hello-pangea/dnd
- **Shadcn/UI**: Modern, accessible component library
- **Testing**: Comprehensive testing suite using Vitest
- **Tailwind CSS**: Utility-first styling with consistent design patterns

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn or pnpm
- Git

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/task-management-app.git
cd task-management-app
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:

```bash
cp env.example .env.local
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Key Features

The application provides a robust task management experience with:

- Drag-and-drop task organization across status columns
- Persistent state management with localStorage
- Optimistic updates for smooth user experience
- Responsive design for all device sizes
- Accessible component design
- Real-time task updates
- Error handling and recovery
- Form validation

## 🏗 Architecture & Design Choices

### State Management

We chose Zustand over other state management solutions for its:

- Minimal boilerplate compared to Redux
- Built-in persistence capabilities
- TypeScript-first approach
- Excellent developer experience
- Simple integration with React hooks

### Component Architecture

The application follows a clear component hierarchy:

- TaskBoard: Main orchestrator component
- TaskColumn: Status-specific task containers
- TaskCard: Individual task representation
- TaskToolbar: User controls and actions

### Testing Strategy

Our testing approach ensures reliability through:

- Component unit tests
- Integration tests for user workflows
- Mocked API interactions
- State management tests

### API Integration

The backend integration demonstrates:

- Clean separation of concerns
- Type-safe API calls
- Error handling patterns
- Optimistic updates
- Data synchronization

## 🔄 Development Workflow

### Running Tests

```bash
npm test
# or
yarn test
# or
pnpm test
```

### Building for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

## 🔜 Future Improvements

We have several planned enhancements:

1. Integration with real-time updates using WebSockets
2. Enhanced task filtering and search capabilities
3. Team collaboration features
4. Advanced task analytics and reporting
5. Integration with calendar systems
6. Performance optimizations for large task sets (virtualization)
7. Enhanced offline capabilities

## 🚧 Known Limitations

Current limitations include:

1. Limited to local storage persistence as jsonplaceholder API is read-only
2. Basic task management features only
3. No real-time collaboration yet
4. No authentication system yet

## 🔍 For Job Seekers

This project demonstrates several key skills valued by employers:

1. Modern React development practices
2. State management expertise
3. Testing proficiency
4. TypeScript mastery
5. Clean code principles
6. UI/UX considerations
7. Performance optimization
8. Error handling patterns

The codebase showcases professional-grade development practices and architecture decisions that translate directly to enterprise applications.

Anass Boulmane <br/>
📧 anassboulmane@gmail.com | 📞 +212 690434426 <br/>
[LinkedIn](https://www.linkedin.com/in/anas-boulmane/) | [GitHub](https://github.com/AnasBoulmane) <br/>

## 🔍 Other projects

- [advanced-search-dropdown](https://github.com/AnasBoulmane/advanced-search-dropdown): A high-performance, feature-rich dropdown component built with vanilla JavaScript and Tailwind CSS. This implementation focuses on delivering a smooth user experience while maintaining clean, maintainable code architecture.
- [ch-fashion-app](https://github.com/AnasBoulmane/ch-fashion-app): A Chanel's e-commerce platform that showcases modern web architecture, advanced caching strategies, and elegant solutions to complex pagination challenges
