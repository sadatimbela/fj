'use strict';

/**
 * FJ VISUALS — Architectural Studio Client Scripts
 */

document.addEventListener('DOMContentLoaded', () => {

  // 0. Ensure Hero Background Video Plays Muted & Smoothly (Respects prefers-reduced-motion)
  const heroVideo = document.querySelector('.hero-bg-video');
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (heroVideo && !prefersReducedMotion) {
    heroVideo.muted = true;
    heroVideo.setAttribute('muted', '');
    const playPromise = heroVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay policy fallback: re-trigger play on first user interaction
        document.addEventListener('click', () => {
          heroVideo.play();
        }, { once: true });
      });
    }
  } else if (heroVideo && prefersReducedMotion) {
    heroVideo.pause();
  }

  // 1. Editorial Architectural Drawer Navigation & Header Logic
  const navbar = document.querySelector('[data-navbar]');
  const overlay = document.querySelector('[data-overlay]');
  const navCloseBtn = document.querySelector('[data-nav-close-btn]');
  const navOpenBtn = document.querySelector('[data-nav-open-btn]');
  const navbarLinks = document.querySelectorAll('[data-nav-link]');
  let lastFocusedElement = null;

  const openNav = () => {
    if (!navbar || !overlay) return;
    lastFocusedElement = document.activeElement;

    navbar.classList.add('active');
    navbar.setAttribute('aria-hidden', 'false');
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('nav-open');
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    if (navOpenBtn) {
      navOpenBtn.classList.add('active');
      navOpenBtn.setAttribute('aria-expanded', 'true');
    }

    // Move keyboard focus into drawer on open
    setTimeout(() => {
      if (navCloseBtn) {
        navCloseBtn.focus();
      } else {
        const firstLink = navbar.querySelector('.navbar-link');
        if (firstLink) firstLink.focus();
      }
    }, 50);
  };

  const closeNav = () => {
    if (!navbar || !overlay) return;

    navbar.classList.remove('active');
    navbar.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('nav-open');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';

    if (navOpenBtn) {
      navOpenBtn.classList.remove('active');
      navOpenBtn.setAttribute('aria-expanded', 'false');
      // Return focus to menu trigger button
      navOpenBtn.focus();
    } else if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  };

  const toggleNav = () => {
    if (navbar && navbar.classList.contains('active')) {
      closeNav();
    } else {
      openNav();
    }
  };

  if (navOpenBtn) navOpenBtn.addEventListener('click', toggleNav);
  if (navCloseBtn) navCloseBtn.addEventListener('click', closeNav);
  if (overlay) overlay.addEventListener('click', closeNav);

  // Close on nav link click & update active link indicator
  navbarLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (link.classList.contains('navbar-link')) {
        document.querySelectorAll('.navbar-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
      closeNav();
    });
  });

  // Keyboard navigation & accessibility: Esc key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navbar && navbar.classList.contains('active')) {
      e.preventDefault();
      closeNav();
    }
  });

  // Focus trap inside the drawer so keyboard focus cannot escape behind it
  if (navbar) {
    navbar.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;

      const focusable = Array.from(navbar.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ));

      if (focusable.length === 0) return;

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    });
  }

  // Header scroll state: becomes slightly more compact with subtle bottom border
  const header = document.querySelector('[data-header]');
  window.addEventListener('scroll', () => {
    if (header) {
      if (window.scrollY >= 30) {
        header.classList.add('active');
      } else {
        header.classList.remove('active');
      }
    }
  }, { passive: true });

  // 2. Projects Filter Pills (All Projects / Modern Villas / CAD Blueprints)
  const pillBtns = document.querySelectorAll('.pill-btn');
  const propertyCards = document.querySelectorAll('.property-card');

  pillBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      pillBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      propertyCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (filterValue === 'all' || filterValue === 'general' || filterValue === cardCategory) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 2.5. 3D House Reveal Interactive Experience
  const revealCards = document.querySelectorAll('.service-reveal-card');

  revealCards.forEach(card => {
    const visualWrapper = card.querySelector('.card-visual-wrapper');
    const wireframeLayer = card.querySelector('.wireframe-layer');
    const scanBeam = card.querySelector('.reveal-scan-beam');

    if (!visualWrapper || !wireframeLayer || !scanBeam) return;

    // Interactive Cursor Tracking (Split Reveal Slider)
    visualWrapper.addEventListener('mousemove', (e) => {
      const rect = visualWrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));

      visualWrapper.classList.add('interactive-tracking');
      wireframeLayer.style.clipPath = `inset(0 0 0 ${percent}%)`;
      scanBeam.style.left = `${percent}%`;
      scanBeam.style.opacity = '1';

      if (percent > 12) {
        card.classList.add('revealed');
      } else {
        card.classList.remove('revealed');
      }
    });

    // Mouse Leave: Smooth Reset
    visualWrapper.addEventListener('mouseleave', () => {
      visualWrapper.classList.remove('interactive-tracking');
      wireframeLayer.style.clipPath = '';
      scanBeam.style.left = '';
      scanBeam.style.opacity = '';
      card.classList.remove('revealed');
    });

    // Click / Tap to Spotlight / Feature Card
    card.addEventListener('click', (e) => {
      if (e.target.closest('.card-link')) return;

      revealCards.forEach(c => {
        c.classList.remove('featured-card');
        c.classList.remove('active');
        const icon = c.querySelector('.card-icon-badge');
        if (icon) icon.classList.remove('gold-badge');
      });

      card.classList.add('featured-card');
      card.classList.add('active');
      const cardIcon = card.querySelector('.card-icon-badge');
      if (cardIcon) cardIcon.classList.add('gold-badge');
    });

    // Mobile Touch Support
    visualWrapper.addEventListener('touchstart', () => {
      card.classList.toggle('revealed');
    }, { passive: true });
  });

  // Sequential Showcase Wave on First Scroll Entry
  const servicesSection = document.getElementById('services');
  if (servicesSection && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          revealCards.forEach((card, idx) => {
            setTimeout(() => {
              card.classList.add('revealed');
              setTimeout(() => {
                if (!card.classList.contains('featured-card')) {
                  card.classList.remove('revealed');
                }
              }, 1100);
            }, idx * 240);
          });
          observer.disconnect();
        }
      });
    }, { threshold: 0.2 });
    observer.observe(servicesSection);
  }

  // 3. Hero Search Pill Submission
  const heroSearchForm = document.getElementById('hero-search-form');
  const heroSearchInput = document.getElementById('hero-search-input');
  if (heroSearchForm && heroSearchInput) {
    heroSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = heroSearchInput.value.trim().toLowerCase();
      const projectsSection = document.getElementById('projects');
      if (projectsSection) {
        projectsSection.scrollIntoView({ behavior: 'smooth' });
      }

      if (query) {
        if (query.includes('villa') || query.includes('house') || query.includes('home')) {
          const villaBtn = document.querySelector('.pill-btn[data-filter="villas"]');
          if (villaBtn) villaBtn.click();
        } else if (query.includes('cad') || query.includes('draw') || query.includes('plan') || query.includes('blue')) {
          const cadBtn = document.querySelector('.pill-btn[data-filter="drawings"]');
          if (cadBtn) cadBtn.click();
        } else {
          const allBtn = document.querySelector('.pill-btn[data-filter="all"]');
          if (allBtn) allBtn.click();
        }
      }
    });
  }

  // 5. Magnetic CTA Button Animation
  // Idle: perfectly still
  // Hover: button subtly shifts 3–8px toward cursor
  // Leave: smoothly returns
  const magneticButtons = document.querySelectorAll('.magnetic-cta-btn, [data-magnetic]');

  magneticButtons.forEach((btn) => {
    const content = btn.querySelector('.magnetic-cta-content') || btn;
    let isHovering = false;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId = null;

    function updatePosition() {
      if (!isHovering) return;

      // Smooth interpolation
      currentX += (targetX - currentX) * 0.25;
      currentY += (targetY - currentY) * 0.25;

      btn.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
      if (content !== btn) {
        content.style.transform = `translate3d(${(currentX * 0.4).toFixed(2)}px, ${(currentY * 0.4).toFixed(2)}px, 0)`;
      }

      rafId = requestAnimationFrame(updatePosition);
    }

    btn.addEventListener('mouseenter', () => {
      isHovering = true;
      btn.style.transition = 'box-shadow 0.3s ease, background 0.3s ease';
      if (content !== btn) content.style.transition = 'none';
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updatePosition);
    });

    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.hypot(dx, dy);

      if (dist === 0) {
        targetX = 0;
        targetY = 0;
      } else {
        const maxRadius = Math.hypot(rect.width / 2, rect.height / 2);
        const ratio = Math.min(dist / (maxRadius || 1), 1);
        // Constrain shift strictly between 3px and 8px toward cursor
        const shiftDist = 3 + ratio * 5;
        targetX = (dx / dist) * shiftDist;
        targetY = (dy / dist) * shiftDist;
      }
    });

    btn.addEventListener('mouseleave', () => {
      isHovering = false;
      if (rafId) cancelAnimationFrame(rafId);

      targetX = 0;
      targetY = 0;
      currentX = 0;
      currentY = 0;

      // Smooth return transition
      btn.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease, background 0.3s ease';
      btn.style.transform = 'translate3d(0px, 0px, 0px)';

      if (content !== btn) {
        content.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
        content.style.transform = 'translate3d(0px, 0px, 0px)';
      }
    });
  });

  // 6. Contact Form Submit Handler
  const cleanForm = document.getElementById('clean-project-form');
  const cleanAlert = document.getElementById('clean-form-alert');

  if (cleanForm) {
    cleanForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('c-name')?.value || 'there';

      if (cleanAlert) {
        cleanAlert.style.display = 'block';
        cleanAlert.innerHTML = `<strong>Thank you, ${name}!</strong> Your architectural project inquiry has been received. Our team will contact you within 24 hours.`;
        cleanForm.reset();
        setTimeout(() => {
          cleanAlert.style.display = 'none';
        }, 8000);
      }
    });
  }

  // 7. Project Photo Perspectives (Interactive Pop-Up Thumbnails & Lightbox Modal)
  const archProjectCards = document.querySelectorAll('.project-card, .work-card');
  const photoLightbox = document.getElementById('photo-lightbox');
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');
  const lightboxMainImg = document.getElementById('lightbox-main-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxLocation = document.getElementById('lightbox-location');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const lightboxPrevBtn = document.getElementById('lightbox-prev-btn');
  const lightboxNextBtn = document.getElementById('lightbox-next-btn');
  const lightboxFilmstrip = document.getElementById('lightbox-filmstrip');

  let activeLightboxPhotos = [];
  let currentLightboxIdx = 0;
  let activeLightboxProject = { title: '', location: '' };

  function renderLightboxSlide(idx) {
    if (!activeLightboxPhotos.length) return;
    currentLightboxIdx = (idx + activeLightboxPhotos.length) % activeLightboxPhotos.length;
    const currentPhoto = activeLightboxPhotos[currentLightboxIdx];

    if (lightboxMainImg) {
      lightboxMainImg.src = currentPhoto.src;
      lightboxMainImg.alt = currentPhoto.alt || 'Architectural perspective';
      // Trigger pop-up animation
      lightboxMainImg.style.animation = 'none';
      lightboxMainImg.offsetHeight; // reflow
      lightboxMainImg.style.animation = 'lightboxPhotoPopUp 380ms cubic-bezier(0.34, 1.35, 0.64, 1)';
    }

    if (lightboxCounter) {
      lightboxCounter.textContent = `View ${currentLightboxIdx + 1} of ${activeLightboxPhotos.length}`;
    }

    if (lightboxFilmstrip) {
      const thumbs = lightboxFilmstrip.querySelectorAll('.lightbox-filmstrip-thumb');
      thumbs.forEach((t, i) => t.classList.toggle('active', i === currentLightboxIdx));
    }
  }

  function openPhotoLightbox(projectData, photos, startIdx = 0) {
    if (!photoLightbox) return;
    activeLightboxPhotos = photos;
    activeLightboxProject = projectData;
    currentLightboxIdx = startIdx;

    if (lightboxTitle) lightboxTitle.textContent = projectData.title || 'Architectural Project';
    if (lightboxLocation) lightboxLocation.innerHTML = `&#x2316; ${projectData.location || 'Selected Work'}`;

    // Populate filmstrip
    if (lightboxFilmstrip) {
      lightboxFilmstrip.innerHTML = '';
      photos.forEach((photo, idx) => {
        const thumbBtn = document.createElement('button');
        thumbBtn.type = 'button';
        thumbBtn.className = `lightbox-filmstrip-thumb ${idx === startIdx ? 'active' : ''}`;
        thumbBtn.setAttribute('aria-label', `Jump to perspective ${idx + 1}`);
        thumbBtn.innerHTML = `<img src="${photo.src}" alt="${photo.alt || 'Perspective'}">`;
        thumbBtn.addEventListener('click', () => renderLightboxSlide(idx));
        lightboxFilmstrip.appendChild(thumbBtn);
      });
    }

    renderLightboxSlide(startIdx);
    photoLightbox.classList.add('open');
    photoLightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closePhotoLightbox() {
    if (!photoLightbox) return;
    photoLightbox.classList.remove('open');
    photoLightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', closePhotoLightbox);
  }

  if (photoLightbox) {
    photoLightbox.addEventListener('click', (e) => {
      if (e.target === photoLightbox) closePhotoLightbox();
    });
  }

  if (lightboxPrevBtn) {
    lightboxPrevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      renderLightboxSlide(currentLightboxIdx - 1);
    });
  }

  if (lightboxNextBtn) {
    lightboxNextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      renderLightboxSlide(currentLightboxIdx + 1);
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!photoLightbox || !photoLightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closePhotoLightbox();
    if (e.key === 'ArrowLeft') renderLightboxSlide(currentLightboxIdx - 1);
    if (e.key === 'ArrowRight') renderLightboxSlide(currentLightboxIdx + 1);
  });

  archProjectCards.forEach((card) => {
    const slidesTrack = card.querySelector('.project-slides, .work-slides');
    const images = Array.from(card.querySelectorAll('.project-img'));
    const indicators = card.querySelectorAll('.project-dot, .work-indicator');
    const thumbs = card.querySelectorAll('.photo-thumb-btn');
    const titleEl = card.querySelector('.project-name');
    const locEl = card.querySelector('.project-location');

    const projectData = {
      title: titleEl ? titleEl.textContent.trim() : 'Architectural Project',
      location: locEl ? locEl.textContent.replace('⌖', '').trim() : ''
    };

    const photoList = images.map(img => ({
      src: img.getAttribute('src'),
      alt: img.getAttribute('alt')
    }));

    if (!slidesTrack) return;

    const selectPerspective = (idx) => {
      slidesTrack.style.transform = `translateX(-${idx * 100}%)`;

      // Trigger pop-up reveal animation on newly active image
      images.forEach((img, i) => {
        img.classList.remove('popping-up');
        if (i === idx) {
          void img.offsetWidth; // force reflow
          img.classList.add('popping-up');
        }
      });

      // Sync active state on thumbnails and indicator dots
      thumbs.forEach((thumb, i) => thumb.classList.toggle('active', i === idx));
      indicators.forEach((ind, i) => ind.classList.toggle('active', i === idx));
    };

    // Wire up each perspective thumbnail button
    thumbs.forEach((thumb, idx) => {
      thumb.style.pointerEvents = 'auto';

      // Click to switch photo with pop-up reveal
      thumb.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        card.classList.add('photos-revealed');
        selectPerspective(idx);
      });

      // Touch tap support: immediate tactile response on touch screens
      thumb.addEventListener('touchstart', (e) => {
        e.stopPropagation();
      }, { passive: true });

      thumb.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        card.classList.add('photos-revealed');
        selectPerspective(idx);
      });

      // Hover to preview perspective immediately (desktop)
      thumb.addEventListener('mouseenter', (e) => {
        e.stopPropagation();
        selectPerspective(idx);
      });
    });

    // Wire up fallback indicator dots
    indicators.forEach((dot, idx) => {
      dot.style.pointerEvents = 'auto';
      dot.style.cursor = 'pointer';

      dot.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        card.classList.add('photos-revealed');
        selectPerspective(idx);
      });

      dot.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        card.classList.add('photos-revealed');
        selectPerspective(idx);
      });

      dot.addEventListener('mouseenter', (e) => {
        e.stopPropagation();
        selectPerspective(idx);
      });
    });

    // Touch & Swipe gestures on project media for mobile & tablet screens
    const mediaEl = card.querySelector('.project-media');
    if (mediaEl) {
      let touchStartX = 0;
      let touchStartY = 0;
      let touchStartTime = 0;
      let isSwiping = false;

      mediaEl.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          touchStartTime = Date.now();
          isSwiping = false;
        }
      }, { passive: true });

      mediaEl.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1) {
          const deltaX = Math.abs(e.touches[0].clientX - touchStartX);
          const deltaY = Math.abs(e.touches[0].clientY - touchStartY);
          if (deltaX > 15 && deltaX > deltaY) {
            isSwiping = true;
          }
        }
      }, { passive: true });

      mediaEl.addEventListener('touchend', (e) => {
        if (e.changedTouches.length === 1) {
          const deltaX = e.changedTouches[0].clientX - touchStartX;
          const deltaY = e.changedTouches[0].clientY - touchStartY;
          const deltaTime = Date.now() - touchStartTime;

          // Detect horizontal swipe (> 30px, predominantly horizontal, < 600ms)
          if (Math.abs(deltaX) > 30 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2 && deltaTime < 600) {
            e.preventDefault();
            e.stopPropagation();
            card.classList.add('photos-revealed');
            const activeIdx = Array.from(thumbs).findIndex(t => t.classList.contains('active'));
            const count = images.length || 4;
            if (deltaX < 0) {
              // Swiped left -> next perspective
              selectPerspective((activeIdx + 1) % count);
            } else {
              // Swiped right -> previous perspective
              selectPerspective((activeIdx - 1 + count) % count);
            }
            return;
          }
        }
      }, { passive: false });

      mediaEl.addEventListener('click', (e) => {
        if (e.target.closest('.photo-thumb-btn') || e.target.closest('.project-inquire-subordinate')) return;
        if (isSwiping) return;

        // Ensure thumbnails are revealed on tap on touch screens
        card.classList.add('photos-revealed');

        // If clicking directly on photo, open lightbox modal
        if (e.target.closest('.project-slides') || e.target.closest('.project-media-overlay')) {
          e.preventDefault();
          e.stopPropagation();
          const activeIdx = Array.from(thumbs).findIndex(t => t.classList.contains('active'));
          openPhotoLightbox(projectData, photoList, Math.max(0, activeIdx));
        }
      });
    }

    // Return to primary perspective on mouse leave (desktop with true hover only)
    card.addEventListener('mouseleave', () => {
      if (window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        selectPerspective(0);
        card.classList.remove('photos-revealed');
      }
    });
  });

  // 8. Architectural Project Inquiry Modal
  const quoteModal = document.getElementById('quote-modal');
  const quoteCloseBtn = document.getElementById('quote-modal-close');
  const quoteForm = document.getElementById('instant-quote-form');
  const quoteSuccessPanel = document.getElementById('quote-success-panel');
  const quoteSuccessDoneBtn = document.getElementById('quote-success-done-btn');
  const quoteTargetProject = document.getElementById('quote-target-project');
  const quoteNameInput = document.getElementById('quote-name');
  const quotePhoneInput = document.getElementById('quote-phone');
  const quoteLocationInput = document.getElementById('quote-location');
  const quoteAreaInput = document.getElementById('quote-sqm');
  const quoteAreaNotSureBtn = document.getElementById('area-not-sure-btn');
  const quoteDescInput = document.getElementById('quote-desc');
  const quoteProjectTypeInput = document.getElementById('quote-project-type');
  const quoteRoomsInput = document.getElementById('quote-rooms');
  const quoteSubmitBtn = document.getElementById('quote-submit-btn');

  const typeButtons = document.querySelectorAll('.type-pill-btn');
  const roomButtons = document.querySelectorAll('.room-pill-btn');
  const scopeResidential = document.getElementById('scope-residential');
  const scopeCommercial = document.getElementById('scope-commercial');
  const scopeOther = document.getElementById('scope-other');
  const quoteTriggers = document.querySelectorAll('[data-quote-trigger]');

  // Clear validation errors
  const clearValidationErrors = () => {
    document.querySelectorAll('.quote-form-group.has-error').forEach((grp) => {
      grp.classList.remove('has-error');
    });
  };

  // Reset form to default state
  const resetInquiryForm = () => {
    if (quoteForm) {
      quoteForm.reset();
      quoteForm.style.display = 'block';
    }
    if (quoteSuccessPanel) {
      quoteSuccessPanel.style.display = 'none';
    }
    clearValidationErrors();

    if (quoteSubmitBtn) {
      quoteSubmitBtn.disabled = false;
      quoteSubmitBtn.innerHTML = '<span class="btn-text">Send Project Inquiry</span><span class="btn-arrow" aria-hidden="true">&rarr;</span>';
    }

    // Reset Project Type to Residential
    if (quoteProjectTypeInput) quoteProjectTypeInput.value = 'Residential';
    typeButtons.forEach((btn, i) => {
      const isRes = btn.getAttribute('data-type') === 'Residential';
      btn.classList.toggle('active', isRes);
      btn.setAttribute('aria-checked', isRes ? 'true' : 'false');
    });
    if (scopeResidential) scopeResidential.style.display = 'flex';
    if (scopeCommercial) scopeCommercial.style.display = 'none';
    if (scopeOther) scopeOther.style.display = 'none';

    // Reset Bedrooms to 3–4
    if (quoteRoomsInput) quoteRoomsInput.value = '3–4';
    roomButtons.forEach((btn) => {
      const isDefault = btn.getAttribute('data-rooms') === '3–4';
      btn.classList.toggle('active', isDefault);
      btn.setAttribute('aria-checked', isDefault ? 'true' : 'false');
    });

    // Reset Area
    if (quoteAreaNotSureBtn) quoteAreaNotSureBtn.classList.remove('active');
    if (quoteAreaInput) {
      quoteAreaInput.disabled = false;
      quoteAreaInput.value = '250';
    }
  };

  function openQuoteModal(projectName, projectLocation) {
    if (!quoteModal) return;
    resetInquiryForm();

    if (quoteTargetProject) {
      quoteTargetProject.textContent = projectName || 'Custom Architectural Design';
    }
    if (quoteLocationInput && projectLocation) {
      quoteLocationInput.value = projectLocation;
    }

    quoteModal.classList.add('open');
    quoteModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus Name input smoothly
    setTimeout(() => {
      if (quoteNameInput) quoteNameInput.focus();
    }, 150);
  }

  function closeQuoteModal() {
    if (!quoteModal) return;
    quoteModal.classList.remove('open');
    quoteModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    clearValidationErrors();
  }

  // Trigger modal when clicking project quote/inquire triggers
  quoteTriggers.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const proj = btn.getAttribute('data-project') || 'Custom Architectural Design';
      const loc = btn.getAttribute('data-location') || '';
      openQuoteModal(proj, loc);
    });
  });

  // Close triggers
  if (quoteCloseBtn) quoteCloseBtn.addEventListener('click', closeQuoteModal);
  if (quoteSuccessDoneBtn) quoteSuccessDoneBtn.addEventListener('click', closeQuoteModal);

  // Close on backdrop click (outside panel)
  if (quoteModal) {
    quoteModal.addEventListener('click', (e) => {
      if (e.target === quoteModal) closeQuoteModal();
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && quoteModal && quoteModal.classList.contains('open')) {
      closeQuoteModal();
    }
  });

  // Project Type Selection (Residential / Commercial / Other)
  typeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      typeButtons.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-checked', 'true');

      const selectedType = btn.getAttribute('data-type') || 'Residential';
      if (quoteProjectTypeInput) quoteProjectTypeInput.value = selectedType;

      // Conditional scope pane display
      if (scopeResidential) scopeResidential.style.display = selectedType === 'Residential' ? 'flex' : 'none';
      if (scopeCommercial) scopeCommercial.style.display = selectedType === 'Commercial' ? 'flex' : 'none';
      if (scopeOther) scopeOther.style.display = selectedType === 'Other' ? 'flex' : 'none';
    });
  });

  // Room / Bedroom Selection (1–2 / 3–4 / 5+ / Not sure)
  roomButtons.forEach((pill) => {
    pill.addEventListener('click', () => {
      roomButtons.forEach((p) => {
        p.classList.remove('active');
        p.setAttribute('aria-checked', 'false');
      });
      pill.classList.add('active');
      pill.setAttribute('aria-checked', 'true');
      const val = pill.getAttribute('data-rooms') || '3–4';
      if (quoteRoomsInput) quoteRoomsInput.value = val;
    });
  });

  // Area "Not sure" Toggle
  if (quoteAreaNotSureBtn && quoteAreaInput) {
    quoteAreaNotSureBtn.addEventListener('click', () => {
      const isCurrentlyNotSure = quoteAreaNotSureBtn.classList.toggle('active');
      quoteAreaNotSureBtn.setAttribute('aria-pressed', isCurrentlyNotSure ? 'true' : 'false');

      if (isCurrentlyNotSure) {
        quoteAreaInput.dataset.prevVal = quoteAreaInput.value;
        quoteAreaInput.value = '';
        quoteAreaInput.placeholder = 'Not sure';
      } else {
        quoteAreaInput.value = quoteAreaInput.dataset.prevVal || '250';
        quoteAreaInput.placeholder = '250';
      }
    });

    quoteAreaInput.addEventListener('input', () => {
      if (quoteAreaInput.value.trim() !== '') {
        quoteAreaNotSureBtn.classList.remove('active');
        quoteAreaNotSureBtn.setAttribute('aria-pressed', 'false');
      }
    });
  }

  // Real-time error removal on input
  [quoteNameInput, quotePhoneInput, quoteLocationInput].forEach((input) => {
    if (!input) return;
    input.addEventListener('input', () => {
      const group = input.closest('.quote-form-group');
      if (group && group.classList.contains('has-error')) {
        group.classList.remove('has-error');
      }
    });
  });

  // Professional Form Submission & Validation Handler
  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameVal = quoteNameInput ? quoteNameInput.value.trim() : '';
      const phoneVal = quotePhoneInput ? quotePhoneInput.value.trim() : '';
      const locationVal = quoteLocationInput ? quoteLocationInput.value.trim() : '';
      const projectType = quoteProjectTypeInput ? quoteProjectTypeInput.value : 'Residential';
      const projectName = quoteTargetProject ? quoteTargetProject.textContent : 'Architectural Project';

      let hasError = false;
      let firstInvalidInput = null;

      // Validate Name (Required, at least 2 characters)
      const nameGroup = document.getElementById('group-quote-name');
      if (!nameVal || nameVal.length < 2) {
        if (nameGroup) nameGroup.classList.add('has-error');
        hasError = true;
        if (!firstInvalidInput && quoteNameInput) firstInvalidInput = quoteNameInput;
      } else if (nameGroup) {
        nameGroup.classList.remove('has-error');
      }

      // Validate Phone / WhatsApp (Required, at least 6 digits/characters)
      const phoneGroup = document.getElementById('group-quote-phone');
      const cleanDigits = phoneVal.replace(/[^0-9]/g, '');
      if (!phoneVal || cleanDigits.length < 6) {
        if (phoneGroup) phoneGroup.classList.add('has-error');
        hasError = true;
        if (!firstInvalidInput && quotePhoneInput) firstInvalidInput = quotePhoneInput;
      } else if (phoneGroup) {
        phoneGroup.classList.remove('has-error');
      }

      // Validate Location (Required)
      const locationGroup = document.getElementById('group-quote-location');
      if (!locationVal || locationVal.length < 2) {
        if (locationGroup) locationGroup.classList.add('has-error');
        hasError = true;
        if (!firstInvalidInput && quoteLocationInput) firstInvalidInput = quoteLocationInput;
      } else if (locationGroup) {
        locationGroup.classList.remove('has-error');
      }

      if (hasError) {
        if (firstInvalidInput) firstInvalidInput.focus();
        return;
      }

      // Submission state: disable button, show "Sending…"
      if (quoteSubmitBtn) {
        quoteSubmitBtn.disabled = true;
        quoteSubmitBtn.innerHTML = '<span class="btn-text">Sending…</span>';
      }

      // Simulated network dispatch (600ms)
      setTimeout(() => {
        if (quoteSuccessPanel && quoteForm) {
          quoteForm.style.display = 'none';
          quoteSuccessPanel.style.display = 'block';

          const successMsg = document.getElementById('quote-success-msg');
          if (successMsg) {
            successMsg.innerHTML = `Thank you, <strong>${nameVal}</strong>! We have received your inquiry for your <strong>${projectType}</strong> project in <strong>${locationVal}</strong>. Our studio will review your specifications and contact you shortly.`;
          }
        }
      }, 600);
    });
  }

  // 9. Consistent Section Headers Intersection Reveal Animations
  const sectionHeaders = document.querySelectorAll('.section-header');
  if ('IntersectionObserver' in window && sectionHeaders.length > 0) {
    const headerObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          headerObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '100px 0px 0px 0px' });

    sectionHeaders.forEach((header) => headerObserver.observe(header));
  } else {
    sectionHeaders.forEach((header) => header.classList.add('revealed'));
  }

  // 10. How We Work - Scroll-Linked Progressive Timeline Draw & Step Reveals
  const processSection = document.getElementById('process');
  const timelineTree = document.getElementById('timeline-tree');
  const timelineProgressLine = document.getElementById('timeline-line-progress');
  const timelineRows = document.querySelectorAll('.timeline-tree .timeline-row');

  if (processSection && timelineTree && timelineProgressLine) {
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      timelineProgressLine.style.height = '100%';
      timelineRows.forEach(row => row.classList.add('step-active'));
    } else {
      const updateTimelineProgress = () => {
        const treeRect = timelineTree.getBoundingClientRect();
        const windowHeight = window.innerHeight || 800;

        // Line starts drawing when the top of the tree enters the lower 65% of viewport
        const triggerPoint = windowHeight * 0.65;
        const scrollDistance = triggerPoint - treeRect.top;
        const totalDistance = treeRect.height;

        const progress = Math.max(0, Math.min(1, scrollDistance / totalDistance));
        timelineProgressLine.style.height = (progress * 100).toFixed(1) + '%';

        // Reveal each step as the progress line reaches its milestone
        timelineRows.forEach((row) => {
          const rowRect = row.getBoundingClientRect();
          if (rowRect.top + (rowRect.height * 0.4) <= triggerPoint + 50) {
            row.classList.add('step-active');
          }
        });
      };

      let timelineTicking = false;
      window.addEventListener('scroll', () => {
        if (!timelineTicking) {
          requestAnimationFrame(() => {
            updateTimelineProgress();
            timelineTicking = false;
          });
          timelineTicking = true;
        }
      }, { passive: true });

      // Initial check on page load
      updateTimelineProgress();

      // IntersectionObserver for robust fallback
      if ('IntersectionObserver' in window) {
        const rowObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('step-active');
            }
          });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

        timelineRows.forEach(row => rowObserver.observe(row));
      }
    }
  }

  // 11. Hero -> What We Do Scroll-Linked Architectural Transition
  const heroSection = document.getElementById('home');

  if (heroSection && servicesSection) {
    const revealServices = () => {
      servicesSection.classList.add('in-view');
      servicesSection.classList.add('revealed');
    };

    let scrollTicking = false;

    const updateScrollTransition = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const heroRect = heroSection.getBoundingClientRect();
      const servicesRect = servicesSection.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // When the user starts scrolling down or services approaches viewport:
      if (scrollY > 30 || servicesRect.top <= windowHeight - 30) {
        revealServices();
      }

      // Smooth progress calculation for transition
      const transitionDistance = windowHeight * 0.75;
      const scrollOffset = windowHeight - heroRect.bottom;
      const progress = Math.max(0, Math.min(1, scrollOffset / transitionDistance));

      servicesSection.style.setProperty('--scroll-p', progress.toFixed(3));

      scrollTicking = false;
    };

    window.addEventListener('scroll', () => {
      if (!scrollTicking) {
        requestAnimationFrame(updateScrollTransition);
        scrollTicking = true;
      }
    }, { passive: true });

    // Initial check on load
    updateScrollTransition();

    // IntersectionObserver fallback with 0 threshold and 150px margin
    if ('IntersectionObserver' in window) {
      const servicesAnchorObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            revealServices();
            servicesAnchorObserver.unobserve(servicesSection);
          }
        });
      }, { threshold: 0, rootMargin: '150px 0px 0px 0px' });
      servicesAnchorObserver.observe(servicesSection);
    } else {
      revealServices();
    }
  }

  // 12. What We Do -> Featured Projects (Smooth 100–140px Ivory to Navy Transition & Content Reveal)
  const projectsSection = document.getElementById('projects');
  const ivoryNavyTransition = document.getElementById('services-to-projects');

  if (projectsSection) {
    const projectCards = Array.from(projectsSection.querySelectorAll('.project-card'));

    const revealCard = (card) => {
      if (!card.classList.contains('revealed')) {
        card.classList.add('in-view', 'revealed');
      }
      // On touch screens or mobile/tablet devices, automatically reveal other project photos with pop-up animation
      const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
      if (isTouchDevice || window.innerWidth <= 1024) {
        card.classList.add('photos-revealed');
      }
    };

    const revealProjects = () => {
      projectsSection.classList.add('in-view', 'revealed');
      if (ivoryNavyTransition) {
        ivoryNavyTransition.classList.add('in-view', 'revealed');
      }
      projectCards.forEach((card) => revealCard(card));
    };

    const updateProjectsScroll = () => {
      const windowHeight = window.innerHeight || 800;
      const targetEl = ivoryNavyTransition || projectsSection;
      const targetRect = targetEl.getBoundingClientRect();

      // Progress of navy rise as transition zone enters viewport
      const enterDistance = windowHeight * 0.55;
      const scrollOffset = windowHeight - targetRect.top;
      const progress = Math.max(0, Math.min(1, scrollOffset / enterDistance));

      if (ivoryNavyTransition) {
        ivoryNavyTransition.style.setProperty('--navy-rise', progress.toFixed(3));
      }

      // Smooth trigger threshold when scrolling towards Featured Projects
      if (targetRect.top <= windowHeight - 40) {
        projectsSection.classList.add('in-view', 'revealed');
        if (ivoryNavyTransition) {
          ivoryNavyTransition.classList.add('in-view', 'revealed');
        }
      }

      // Reveal cards as each enters view or when section is sufficiently scrolled
      projectCards.forEach((card) => {
        const cardRect = card.getBoundingClientRect();
        if (cardRect.top <= windowHeight - 40) {
          revealCard(card);
        }
      });
    };

    let projectsScrollTicking = false;
    window.addEventListener('scroll', () => {
      if (!projectsScrollTicking) {
        requestAnimationFrame(() => {
          updateProjectsScroll();
          projectsScrollTicking = false;
        });
        projectsScrollTicking = true;
      }
    }, { passive: true });

    // Initial check on load
    updateProjectsScroll();

    // IntersectionObserver for Section & Individual Cards
    if ('IntersectionObserver' in window) {
      const projectsObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            projectsSection.classList.add('in-view', 'revealed');
            if (ivoryNavyTransition) {
              ivoryNavyTransition.classList.add('in-view', 'revealed');
            }
            projectsObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.05, rootMargin: '80px 0px 0px 0px' });

      if (ivoryNavyTransition) projectsObserver.observe(ivoryNavyTransition);
      projectsObserver.observe(projectsSection);

      // Card-specific observer for responsive staggered reveal
      const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            revealCard(entry.target);
            cardObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

      projectCards.forEach((card) => cardObserver.observe(card));
    } else {
      revealProjects();
    }
  }

  // 14. WHO WE ARE Studio Profile Scroll Entrance (Quiet 600-800ms reveal)
  const aboutSection = document.querySelector('#about');
  if (aboutSection) {
    const revealAbout = () => {
      aboutSection.classList.add('in-view', 'revealed');
    };

    if ('IntersectionObserver' in window) {
      const aboutObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            revealAbout();
            aboutObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

      aboutObserver.observe(aboutSection);
    } else {
      revealAbout();
    }
  }

  // 15. FINAL CTA Section Scroll Entrance (Subtle 500-700ms reveal)
  const contactSection = document.querySelector('#contact');
  if (contactSection) {
    const revealContact = () => {
      contactSection.classList.add('in-view', 'revealed');
    };

    if ('IntersectionObserver' in window) {
      const contactObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            revealContact();
            contactObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

      contactObserver.observe(contactSection);
    } else {
      revealContact();
    }
  }

});