# Modern React Portfolio

A professional, dark-themed freelance portfolio website built with React, Tailwind CSS, Framer Motion, and Three.js.

## 🚀 Features

- **Dark/Light Mode**: Persisted user preference with CSS variables for dynamic theming.
- **3D Background**: Interactive particle system using React Three Fiber.
- **Advanced Animations**: Staggered reveals, parallax scrolling, and hover effects.
- **Responsive Design**: Mobile-first approach using Tailwind CSS.
- **Smart Navbar**: Auto-hides on scroll down, reveals on scroll up.
- **Sections**: Hero, About, Skills, Projects, Education, Contact.
- **Easy Customization**: Content managed in `src/data/content.js`.

## 🛠 Tech Stack

- **Core**: React (Vite)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion, GSAP
- **3D Graphics**: Three.js, @react-three/fiber, @react-three/drei, Maath
- **Icons**: React Icons

## 🏃‍♂️ Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## 📝 Customization

### Content
Modify `src/data/content.js` to update text, links, and project details.

### Animations
Adjust animation settings in `src/utils/config.js`:
- **Background**: Control star count, rotation speed, and size.
- **Transitions**: Modify stagger timings and spring physics.

### Theme
Colors are defined in `src/index.css` using CSS variables (`--color-primary`, `--color-accent`, etc.).

## ⚡ Performance Optimization

- **3D Rendering**: The background uses `Points` and `PointMaterial` for efficient rendering of thousands of particles in a single draw call.
- **Lazy Loading**: Ensure large assets are optimized.
- **Reduced Motion**: The 3D background is lightweight, but can be disabled in `App.jsx` if needed for lower-end devices.

## 📄 License

MIT
