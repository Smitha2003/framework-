// Initialize AOS
AOS.init({
  duration: 1000,
  once: true,
  offset: 100
});

// 3D Canvas Animation for Hero Section
function initHeroAnimation() {
  const canvas = document.getElementById('canvas-hero');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const width = canvas.width = window.innerWidth;
  const height = canvas.height = window.innerHeight;

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.z = Math.random() * 100;
      this.size = Math.random() * 2 + 1;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.vz = Math.random() * 0.5 + 0.2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.z += this.vz;

      if (this.x > width + 50) this.x = -50;
      if (this.x < -50) this.x = width + 50;
      if (this.y > height + 50) this.y = -50;
      if (this.y < -50) this.y = height + 50;
      if (this.z > 100) {
        this.z = 0;
        this.x = Math.random() * width;
        this.y = Math.random() * height;
      }
    }

    draw() {
      const scale = 1 - this.z / 100;
      const alpha = scale * 0.6;
      ctx.fillStyle = `rgba(127, 90, 240, ${alpha})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * scale, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const particles = [];
  for (let i = 0; i < 100; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.fillStyle = 'rgba(15, 15, 15, 0.1)';
    ctx.fillRect(0, 0, width, height);

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// FAQ Toggle Functionality
function initFAQ() {
  const faqToggles = document.querySelectorAll('.faq-toggle');

  faqToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const faqItem = toggle.parentElement;
      const isActive = faqItem.classList.contains('active');

      // Close all other FAQs
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
      });

      // Toggle current FAQ
      if (!isActive) {
        faqItem.classList.add('active');
      }
    });
  });
}

// Page Navigation
function navigateTo(page) {
  window.location.href = page;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initHeroAnimation();
  initFAQ();
});
