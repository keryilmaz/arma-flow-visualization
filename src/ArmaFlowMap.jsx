import React, { useRef, useEffect, useState } from 'react';
import p5 from 'p5';

const ArmaFlowMap = () => {
  const sketchRef = useRef();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showControls, setShowControls] = useState(false);
  
  // Particle control states
  const [controls, setControls] = useState({
    particleSize: 1.0,
    velocity: 1.0,
    frequency: 1.0,
    lifespan: 1.0,
    opacity: 1.0,
    trailLength: 1.0,
    pulseIntensity: 1.0,
    maxParticles: 500
  });

  const updateControl = (key, value) => {
    setControls(prev => ({
      ...prev,
      [key]: value
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.arma.xyz/api/v1/8453/stats');
        const result = await response.json();
        console.log('API Data:', result);
        setData(result);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Use mock data if API fails
        setData({
          total_balance: 4276263.06,
          total_users: 12702,
          total_apr: 5.89,
          liquidity_distribution: {
            protocols: [
              { protocol: "moonwell", balances: [{ amount: 752711.42 }] },
              { protocol: "morpho_seamless_usdc_vault", balances: [{ amount: 1976102.41 }] },
              { protocol: "aave", balances: [{ amount: 28072.26 }] },
              { protocol: "compound", balances: [{ amount: 259374.36 }] },
              { protocol: "morpho_universal_usdc", balances: [{ amount: 584300.88 }] },
              { protocol: "fluid", balances: [{ amount: 150092.80 }] },
              { protocol: "morpho_moonwell_flagship_usdc", balances: [{ amount: 526828.65 }] }
            ]
          }
        });
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!data || loading) return;

    console.log('Setting up p5 sketch with data:', data);

    const sketch = (p) => {
      let particles = [];
      let protocols = [];
      let flowPaths = [];
      let showDetails = false;
      let hoveredProtocol = null;
      let showFlowLines = false; // Start with lines hidden
      
      const colors = {
        moonwell: [80, 140, 255],      // Bright blue from palette
        morpho: [140, 80, 255],        // Purple from palette  
        aave: [255, 140, 80],          // Orange from palette
        compound: [80, 200, 180],      // Teal from palette
        fluid: [255, 100, 140],        // Pink from palette
        usdc: [120, 160, 255],         // Light blue from palette
        // Additional colors from your palette
        purple: [180, 100, 255],
        darkBlue: [60, 120, 255],
        coral: [255, 120, 100],
        mint: [100, 255, 180]
      };

      p.setup = () => {
        console.log('p5 setup called');
        p.createCanvas(1200, 800);
        setupProtocols();
        createFlowPaths();
        console.log('Setup complete. Protocols:', protocols.length, 'FlowPaths:', flowPaths.length);
      };

      const setupProtocols = () => {
        const protocolMapping = {
          moonwell: { name: 'Moonwell', color: colors.moonwell },
          morpho_seamless_usdc_vault: { name: 'Morpho Seamless', color: colors.purple },
          aave: { name: 'Aave', color: colors.aave },
          compound: { name: 'Compound', color: colors.compound },
          morpho_universal_usdc: { name: 'Morpho Universal', color: colors.morpho },
          fluid: { name: 'Fluid', color: colors.fluid },
          morpho_moonwell_flagship_usdc: { name: 'Morpho Flagship', color: colors.coral }
        };

        const protocolData = data.liquidity_distribution.protocols.map(protocol => ({
          name: protocolMapping[protocol.protocol]?.name || protocol.protocol,
          balance: protocol.balances[0]?.amount || 0,
          color: protocolMapping[protocol.protocol]?.color || colors.usdc
        }));

        const maxBalance = Math.max(...protocolData.map(p => p.balance));
        
        protocolData.forEach((protocol, i) => {
          const y = p.map(i, 0, protocolData.length - 1, 150, p.height - 150);
          const size = p.map(protocol.balance, 0, maxBalance, 30, 100);
          
          protocols.push({
            ...protocol,
            x: p.width - 200,
            y: y,
            size: size,
            targetSize: size,
            currentSize: size
          });
        });
      };

      const createFlowPaths = () => {
        const targetX = 100; // USDC destination
        const targetY = p.height / 2;
        
        protocols.forEach((protocol, i) => {
          const curvature = p.random(0.3, 0.7);
          const midX = p.lerp(protocol.x, targetX, curvature);
          const midY = p.lerp(protocol.y, targetY, 0.5) + p.random(-50, 50);
          
          // Create starting point behind the protocol circle
          const behindDistance = 50; // Distance behind the circle
          const directionX = protocol.x - targetX;
          const directionY = protocol.y - targetY;
          const magnitude = Math.sqrt(directionX * directionX + directionY * directionY);
          const normalizedX = directionX / magnitude;
          const normalizedY = directionY / magnitude;
          
          const startX = protocol.x + normalizedX * behindDistance;
          const startY = protocol.y + normalizedY * behindDistance;
          
          flowPaths.push({
            source: { x: startX, y: startY }, // Start from behind protocol
            mid: { x: midX, y: midY },
            target: { x: targetX, y: targetY }, // Flow toward USDC
            protocol: protocol,
            thickness: p.map(protocol.balance, 0, 2000000, 5, 50),
            particles: []
          });
        });
      };

      p.draw = () => {
        p.background(0, 0, 0); // Pure black background
        
        // Reset hovered protocol each frame
        hoveredProtocol = null;
        
        drawBackground();
        drawFlows(); // Always process flows for particle generation
        drawParticles();
        drawProtocols();
        drawSource(); // Draw source last so text appears on top
        updateParticles();
        drawStats();
      };

      const drawBackground = () => {
        for (let i = 0; i < 50; i++) {
          p.stroke(50, 50, 70, 30);
          p.strokeWeight(1);
          const x = p.random(p.width);
          const y = p.random(p.height);
          p.point(x, y);
        }
      };

      const drawSource = () => {
        // Check if mouse is hovering over source
        const sourceDist = p.dist(p.mouseX, p.mouseY, 100, p.height / 2);
        const sourceHovered = sourceDist < 40;
        
        p.fill(...colors.usdc, sourceHovered ? 200 : 150);
        p.noStroke();
        p.ellipse(100, p.height / 2, 80, 80);
        
        // Only show text on hover
        if (sourceHovered || showDetails) {
          p.fill(255);
          p.textAlign(p.CENTER, p.CENTER);
          p.textSize(12);
          p.text('USDC', 100, p.height / 2 - 10);
          p.textSize(10);
          p.text('$7.3M', 100, p.height / 2 + 10);
        }
      };

      const drawFlows = () => {
        flowPaths.forEach(flow => {
          // All flows generate particles at same rate - only controlled by user settings
          const particleFrequency = 5 / controls.frequency; // Fixed base frequency
          const particleCount = Math.floor(4 * controls.frequency); // Fixed base count
          
          if (p.frameCount % Math.floor(particleFrequency) === 0) {
            for (let i = 0; i < particleCount; i++) {
              createParticle(flow, i * 0.05); // Smaller stagger for denser flow
            }
          }
          
          // Equal additional generation for all flows
          if (p.random() < 0.2 * controls.frequency) {
            createParticle(flow, p.random(0, 0.1));
          }
          
          // Only draw lines if showFlowLines is true
          if (showFlowLines) {
            const alpha = p.map(flow.thickness, 5, 50, 50, 150);
            p.stroke(...flow.protocol.color, alpha);
            p.strokeWeight(flow.thickness);
            p.noFill();
            
            // Draw path from protocol area to USDC
            p.bezier(
              flow.source.x, flow.source.y,
              flow.mid.x, flow.source.y,
              flow.mid.x, flow.target.y,
              flow.target.x, flow.target.y
            );
          }
        });
      };

      const drawProtocols = () => {
        protocols.forEach(protocol => {
          protocol.currentSize = p.lerp(protocol.currentSize, protocol.targetSize, 0.1);
          
          // Check if mouse is hovering over this protocol
          const dist = p.dist(p.mouseX, p.mouseY, protocol.x, protocol.y);
          const isHovered = dist < protocol.currentSize / 2;
          
          if (isHovered) {
            hoveredProtocol = protocol;
          }
          
          p.fill(...protocol.color, isHovered ? 220 : 180);
          p.noStroke();
          p.ellipse(protocol.x, protocol.y, protocol.currentSize, protocol.currentSize);
          
          // Only show text on hover
          if (isHovered || showDetails) {
            p.fill(255);
            p.textAlign(p.LEFT, p.CENTER);
            p.textSize(12);
            p.text(protocol.name, protocol.x + protocol.currentSize/2 + 10, protocol.y - 5);
            p.textSize(10);
            p.text(`$${(protocol.balance / 1000000).toFixed(2)}M`, protocol.x + protocol.currentSize/2 + 10, protocol.y + 10);
          }
        });
      };

      const createParticle = (flow, timeOffset = 0) => {
        // Create shooting star particle with trail history
        const baseSpeed = 0.015 * controls.velocity;
        const speedVariation = p.random(0.8, 1.2);
        
        particles.push({
          t: timeOffset,
          flow: flow,
          color: [...flow.protocol.color],
          speed: baseSpeed * speedVariation,
          initialAlpha: p.random(180, 255) * controls.opacity,
          lifeMultiplier: controls.lifespan,
          trail: [], // Store trail positions
          maxTrailLength: Math.floor(20 * controls.trailLength), // Dynamic trail length
          brightness: p.random(0.7, 1.0)
        });
      };

      const drawParticles = () => {
        particles.forEach(particle => {
          const pos = getBezierPoint(particle.flow, particle.t);
          
          // Add current position to trail
          particle.trail.push({
            x: pos.x,
            y: pos.y,
            life: 1.0
          });
          
          // Limit trail length
          if (particle.trail.length > particle.maxTrailLength) {
            particle.trail.shift();
          }
          
          // Draw shooting star trail with additive blending
          if (particle.trail.length > 1 && controls.trailLength > 0) {
            p.blendMode(p.ADD); // Enable glow effect for trails
            
            for (let i = 0; i < particle.trail.length - 1; i++) {
              const current = particle.trail[i];
              const next = particle.trail[i + 1];
              
              // Calculate trail fade
              const trailProgress = i / (particle.trail.length - 1);
              const alpha = (1 - trailProgress) * particle.brightness * controls.opacity;
              
              // Create gradient stroke with multiple layers
              const strokeWidth = p.map(trailProgress, 0, 1, 6 * controls.particleSize, 0.5);
              
              // Outer glow layer
              p.stroke(...particle.color, alpha * 30);
              p.strokeWeight(strokeWidth * 3);
              p.line(current.x, current.y, next.x, next.y);
              
              // Middle layer
              p.stroke(...particle.color, alpha * 60);
              p.strokeWeight(strokeWidth * 1.5);
              p.line(current.x, current.y, next.x, next.y);
              
              // Inner core
              p.stroke(...particle.color, alpha * 120);
              p.strokeWeight(strokeWidth * 0.8);
              p.line(current.x, current.y, next.x, next.y);
              
              // Bright center line for recent trail
              if (trailProgress > 0.7) {
                p.stroke(255, 255, 255, alpha * 80);
                p.strokeWeight(strokeWidth * 0.2);
                p.line(current.x, current.y, next.x, next.y);
              }
            }
            
            p.blendMode(p.BLEND); // Reset blend mode
          }
          
          // Draw bright particle head with additive glow
          p.blendMode(p.ADD);
          const headSize = 6 * controls.particleSize;
          const glowSize = headSize * 4;
          
          // Large outer glow
          p.fill(...particle.color, 15 * controls.opacity);
          p.noStroke();
          p.ellipse(pos.x, pos.y, glowSize, glowSize);
          
          // Medium glow
          p.fill(...particle.color, 40 * controls.opacity);
          p.ellipse(pos.x, pos.y, headSize * 2, headSize * 2);
          
          // Inner glow
          p.fill(...particle.color, 80 * controls.opacity * particle.brightness);
          p.ellipse(pos.x, pos.y, headSize, headSize);
          
          // Bright core
          p.fill(...particle.color, 150 * controls.opacity * particle.brightness);
          p.ellipse(pos.x, pos.y, headSize * 0.6, headSize * 0.6);
          
          // Ultra-bright white center
          p.fill(255, 255, 255, 120 * controls.opacity * particle.brightness);
          p.ellipse(pos.x, pos.y, headSize * 0.2, headSize * 0.2);
          
          p.blendMode(p.BLEND); // Reset blend mode
        });
      };

      const updateParticles = () => {
        for (let i = particles.length - 1; i >= 0; i--) {
          particles[i].t += particles[i].speed;
          
          // Update trail life
          particles[i].trail.forEach(point => {
            point.life -= 0.02; // Trail decay rate
          });
          
          // Remove expired trail points
          particles[i].trail = particles[i].trail.filter(point => point.life > 0);
          
          // Remove completed particles
          const endTime = particles[i].lifeMultiplier;
          if (particles[i].t >= endTime) {
            particles.splice(i, 1);
          }
        }
        
        // Limit total particles for performance
        if (particles.length > controls.maxParticles) {
          particles.splice(0, particles.length - controls.maxParticles);
        }
      };

      const getBezierPoint = (flow, t) => {
        const x = p.bezierPoint(
          flow.source.x, flow.mid.x, flow.mid.x, flow.target.x, t
        );
        const y = p.bezierPoint(
          flow.source.y, flow.source.y, flow.target.y, flow.target.y, t
        );
        return { x, y };
      };

      const drawStats = () => {
        // Always show title
        p.fill(255, 255, 255, 200);
        p.textAlign(p.LEFT, p.TOP);
        p.textSize(24);
        p.text("ARMA's Liquidity Flow", 50, 50);
        
        // Check if mouse is in top-left area to show details
        const showStatsDetail = p.mouseX < 400 && p.mouseY < 220;
        
        if (showStatsDetail || showDetails) {
          p.textSize(12);
          p.text(`Total Balance: $${(data.total_balance / 1000000).toFixed(2)}M`, 50, 90);
          p.text(`Total Users: ${data.total_users.toLocaleString()}`, 50, 110);
          p.text(`APR: ${data.total_apr.toFixed(2)}%`, 50, 130);
          p.text(`Active Agents: ${particles.length}`, 50, 150);
          
          // Flow activity indicators
          p.textSize(10);
          p.fill(255, 255, 255, 150);
          p.text('● Agents flow from protocols to USDC source', 50, 180);
          p.text('● Reverse liquidity flow visualization', 50, 195);
          p.text(`● Press D for details, L for lines ${showFlowLines ? '(ON)' : '(OFF)'}`, 50, 210);
          p.text(`● Press C for controls`, 50, 225);
        } else {
          // Show minimal info when not hovering
          p.textSize(10);
          p.fill(255, 255, 255, 120);
          p.text('Hover for details', 50, 85);
        }
      };

      p.mousePressed = () => {
        protocols.forEach(protocol => {
          const dist = p.dist(p.mouseX, p.mouseY, protocol.x, protocol.y);
          if (dist < protocol.size / 2) {
            protocol.targetSize = protocol.size * 1.5;
            setTimeout(() => {
              protocol.targetSize = protocol.size;
            }, 1000);
          }
        });
      };

      p.keyPressed = () => {
        if (p.key === 'd' || p.key === 'D') {
          showDetails = !showDetails;
        }
        if (p.key === 'l' || p.key === 'L') {
          showFlowLines = !showFlowLines;
        }
        if (p.key === 'c' || p.key === 'C') {
          setShowControls(!showControls);
        }
      };
    };

    let p5Instance;
    try {
      p5Instance = new p5(sketch, sketchRef.current);
      console.log('p5 instance created successfully');
    } catch (error) {
      console.error('Error creating p5 instance:', error);
    }

    return () => {
      if (p5Instance) {
        p5Instance.remove();
      }
    };
  }, [data, loading, controls]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#141923',
        color: 'white',
        fontSize: '20px'
      }}>
        Loading ARMA flow data...
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#141923',
        color: 'white',
        fontSize: '20px'
      }}>
        Failed to load data
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: '#141923', overflow: 'hidden', position: 'relative' }}>
      <div ref={sketchRef} style={{ width: '100%', height: '100%' }} />
      
      {/* Control Panel */}
      {showControls && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '300px',
          backgroundColor: 'rgba(20, 25, 35, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '20px',
          color: 'white',
          fontFamily: 'Arial, sans-serif',
          fontSize: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '15px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            paddingBottom: '10px'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Agent Controls</h3>
            <button 
              onClick={() => setShowControls(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '2px 6px'
              }}
            >×</button>
          </div>

          {/* Size Control */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Size: {controls.particleSize.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.1"
              max="3.0"
              step="0.1"
              value={controls.particleSize}
              onChange={(e) => updateControl('particleSize', parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Velocity Control */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Velocity: {controls.velocity.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.1"
              max="5.0"
              step="0.1"
              value={controls.velocity}
              onChange={(e) => updateControl('velocity', parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Frequency Control */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Frequency: {controls.frequency.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.1"
              max="5.0"
              step="0.1"
              value={controls.frequency}
              onChange={(e) => updateControl('frequency', parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Lifespan Control */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Lifespan: {controls.lifespan.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.1"
              max="3.0"
              step="0.1"
              value={controls.lifespan}
              onChange={(e) => updateControl('lifespan', parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Opacity Control */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Opacity: {controls.opacity.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
              value={controls.opacity}
              onChange={(e) => updateControl('opacity', parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Trail Length Control */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Trail Length: {controls.trailLength.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0"
              max="3.0"
              step="0.1"
              value={controls.trailLength}
              onChange={(e) => updateControl('trailLength', parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Pulse Intensity Control */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Pulse Intensity: {controls.pulseIntensity.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0"
              max="3.0"
              step="0.1"
              value={controls.pulseIntensity}
              onChange={(e) => updateControl('pulseIntensity', parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Max Particles Control */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Max Particles: {controls.maxParticles}
            </label>
            <input
              type="range"
              min="50"
              max="1000"
              step="50"
              value={controls.maxParticles}
              onChange={(e) => updateControl('maxParticles', parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Reset Button */}
          <button
            onClick={() => setControls({
              particleSize: 1.0,
              velocity: 1.0,
              frequency: 1.0,
              lifespan: 1.0,
              opacity: 1.0,
              trailLength: 1.0,
              pulseIntensity: 1.0,
              maxParticles: 500
            })}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: 'rgba(100, 150, 255, 0.2)',
              border: '1px solid rgba(100, 150, 255, 0.5)',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Reset to Defaults
          </button>
        </div>
      )}
    </div>
  );
};

export default ArmaFlowMap;