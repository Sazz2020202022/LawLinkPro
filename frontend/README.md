# LawLinkPro ⚖️

A modern, professional legal services platform connecting clients with experienced lawyers.

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB
- **Authentication**: JWT
- **Routing**: React Router DOM

## 📁 Project Structure

```
frontend/
├── src/
│   ├── layouts/          # Reusable layout components
│   │   └── Navbar.jsx
│   ├── pages/            # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── components/       # Reusable UI components
│   ├── context/          # React context providers
│   │   └── AuthContext.jsx
│   ├── services/         # API service layer
│   │   └── authService.js
│   ├── utils/            # Utility functions
│   │   └── api.js
│   ├── assets/           # Static assets
│   ├── App.jsx           # Main app with routing
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles with Tailwind
backend/
├── models/               # Database models
├── routes/               # API route handlers
├── middleware/           # Custom middleware
├── config/               # Configuration files
└── server.js             # Express server

```

## 🚀 Getting Started

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm start
```

## 🎨 Features

- User authentication (Register/Login)
- Responsive design with Tailwind CSS
- Modern UI with smooth animations
- JWT-based authentication
- Clean and maintainable code structure

## 📝 Development

Ready for feature development. The project structure is set up with:
- ✅ Authentication flow
- ✅ API integration layer
- ✅ Context management
- ✅ Routing configuration
- ✅ Tailwind CSS setup
## 💻 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd LawLinkPro
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎯 Key Pages

### Home Page
- Hero section with call-to-action buttons
- Feature showcase with 6 key benefits
- How it works (3-step process)
- Stats section
- Footer with links

### Login Page
- Email and password fields
- Remember me checkbox
- Forgot password link
- Side panel with benefits

### Register Page
- Full registration form with validation
- User type selection (Client/Lawyer)
- Terms acceptance
- Visual benefits list

## 🔧 Customization

### Colors
Modify colors in `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: { ... },
      secondary: { ... }
    }
  }
}
```

### Components
- Add new pages in `src/pages/`
- Add new layouts in `src/layouts/`
- Update routes in `src/App.jsx`

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

All components are fully responsive using Tailwind's breakpoint system.

## 🎨 Tailwind CSS Approach

This project uses **inline Tailwind CSS classes** exclusively:
- No separate CSS files per component
- All styling through Tailwind utility classes
- Global styles in `index.css` using `@layer` directives
- Custom theme extensions in Tailwind config

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Tailwind CSS for the amazing utility-first framework
- React team for the excellent library
- Vite for the lightning-fast build tool
