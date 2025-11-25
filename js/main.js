document.addEventListener('DOMContentLoaded', () => {

    const video = document.getElementById('hero-video');
    const headlineWrapper = document.querySelector('.headline-wrapper');

    // --- PARALLAX EFFECT ---
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX - window.innerWidth / 2) / window.innerWidth;
        const y = (e.clientY - window.innerHeight / 2) / window.innerHeight;

        // Subtle parallax for background video
        if (video) {
            video.style.transform = `translateX(${x * 15}px) translateY(${y * 10}px) scale(1.1)`;
        }

        // Parallax for headline
        if (headlineWrapper) {
            headlineWrapper.style.transform = `translateX(${x * -6}px) translateY(${y * -4}px)`;
        }
    });


    // --- GOLD DUST PARTICLES ---
    const createParticles = () => {
        if (!particleContainer) return;

        const particleCount = 20; // Number of particles

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');

            const size = Math.random() * 3 + 1; // 1px to 4px
            const xStart = Math.random() * 100; // vw
            const duration = Math.random() * 20 + 15; // 15s to 35s
            const delay = Math.random() * 15; // 0s to 15s

            particle.style.setProperty('--size', `${size}px`);
            particle.style.setProperty('--x-start', `${xStart}vw`);
            particle.style.setProperty('--duration', `${duration}s`);
            particle.style.setProperty('--delay', `${delay}s`);

            particleContainer.appendChild(particle);
        }
    };

    createParticles();

});
