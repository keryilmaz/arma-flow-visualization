# ARMA Flow Visualization

A real-time interactive visualization of liquidity flows across DeFi protocols, built with React and p5.js. This project displays ARMA protocol's liquidity distribution through animated particle systems with customizable controls.

![ARMA Flow Visualization](https://img.shields.io/badge/status-active-brightgreen)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![p5.js](https://img.shields.io/badge/p5.js-1.7.0-red)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- **Real-time Data**: Live liquidity data from ARMA API
- **Interactive Particles**: Animated agents representing liquidity flows
- **Advanced Controls**: 8-parameter control panel for fine-tuning
- **Responsive Design**: Clean, minimal interface with hover interactions
- **Keyboard Shortcuts**: Quick access to features
- **Custom Color Palette**: Carefully designed color scheme
- **Performance Optimized**: Handles 500+ particles smoothly

## 🚀 Demo

Visit the live demo: [Coming Soon - Deploy to your preferred platform]

## 📸 Screenshots

### Main Visualization
The core visualization shows liquidity flowing between ARMA's source and various DeFi protocols.

### Control Panel
Advanced controls for customizing particle behavior, size, velocity, and visual effects.

## 🛠️ Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup
1. Clone the repository:
```bash
git clone https://github.com/keryilmaz/arma-flow-visualization.git
cd arma-flow-visualization
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## 🎮 Usage

### Keyboard Controls
- **`D`** - Toggle detailed information display
- **`L`** - Toggle flow lines visibility
- **`C`** - Open/close control panel

### Control Panel Parameters
- **Size** (0.1x-3.0x) - Particle size multiplier
- **Velocity** (0.1x-5.0x) - Movement speed control
- **Frequency** (0.1x-5.0x) - Particle generation rate
- **Lifespan** (0.1x-3.0x) - How long particles live
- **Opacity** (0.1x-2.0x) - Transparency level
- **Trail Length** (0-3.0x) - Particle trail effects
- **Pulse Intensity** (0-3.0x) - Pulsing animation strength
- **Max Particles** (50-1000) - Performance/density control

### Interactive Elements
- **Hover** over protocols to see names and balances
- **Click** protocol nodes for expansion animation
- **Hover** top-left area for detailed statistics

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18.2.0
- **Graphics**: p5.js 1.7.0
- **Build Tool**: Vite 4.4.0
- **Styling**: Inline styles with CSS-in-JS approach

### Data Flow
```
ARMA API → React State → p5.js Canvas → Real-time Rendering
```

### Key Components
- `ArmaFlowMap.jsx` - Main visualization component
- `setupProtocols()` - Protocol node configuration
- `createFlowPaths()` - Bezier curve path generation
- `particleSystem()` - Dynamic particle management

## 🎨 Design Philosophy

### Visual Principles
- **Minimalism**: Clean interface focusing on the flow visualization
- **Interactivity**: Progressive disclosure of information
- **Performance**: Smooth 60fps animation with efficient particle management
- **Accessibility**: Keyboard navigation and clear visual hierarchy

### Color Palette
The visualization uses a carefully curated color palette:
- **Blues/Teals**: Primary protocols (Moonwell, Compound)
- **Purples**: Morpho protocol variants
- **Orange/Coral**: Accent protocols (Aave)
- **Pink**: Fluid protocol
- **Light Blue**: USDC source

## 📊 API Integration

### Data Source
- **Endpoint**: `https://api.arma.xyz/api/v1/8453/stats`
- **Update Frequency**: Real-time on component mount
- **Fallback**: Mock data for offline development

### Data Structure
```json
{
  "total_balance": 4276263.06,
  "total_users": 12702,
  "total_apr": 5.89,
  "liquidity_distribution": {
    "protocols": [
      {
        "protocol": "moonwell",
        "balances": [{"amount": 752711.42}]
      }
    ]
  }
}
```

## 🚧 Development

### Branch Structure
- **`main`** - Stable production version
- **`v2-development`** - Active development branch

### Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Contributing
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📈 Performance

- **Particle System**: Optimized for 500+ concurrent particles
- **Rendering**: 60fps on modern browsers
- **Memory**: Efficient particle lifecycle management
- **Bundle Size**: ~2MB (including dependencies)

## 🔧 Configuration

### Environment Variables
No environment variables required - the visualization works out of the box.

### Customization
Key parameters can be modified in the control panel or programmatically:
- Particle generation rates
- Visual effects intensity
- Performance limits
- Color schemes

## 📝 Changelog

### v1.0.0 (Current)
- ✅ Initial release with full feature set
- ✅ Real-time ARMA API integration
- ✅ Interactive control panel
- ✅ Custom color palette
- ✅ Performance optimizations

### v2.0.0 (In Development)
- 🚧 Additional visualization modes
- 🚧 Enhanced particle behaviors
- 🚧 Export functionality
- 🚧 Mobile responsiveness improvements

## 🐛 Known Issues

- None currently reported

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **ARMA Protocol** for providing the liquidity data API
- **p5.js Community** for the excellent graphics library
- **React Team** for the robust frontend framework

## 📞 Contact

**Kaan Eryilmaz**
- GitHub: [@keryilmaz](https://github.com/keryilmaz)
- Project Link: [https://github.com/keryilmaz/arma-flow-visualization](https://github.com/keryilmaz/arma-flow-visualization)

---

<div align="center">
  <p><strong>Built with ❤️ for the DeFi community</strong></p>
  <p>🤖 <em>Generated with <a href="https://claude.ai/code">Claude Code</a></em></p>
</div>