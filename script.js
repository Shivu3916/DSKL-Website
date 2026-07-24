/* ==========================================================================
   DSKL Luxury Editorial Web Application Script
   Interactive animations, Dropdown Menu, Accordion, Filter, & Modal handlers
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');
  
  if (mobileToggle && mobileNavDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileNavDrawer.classList.toggle('active');
    });
  }

  // Close mobile nav when clicking a link
  const mobileLinks = document.querySelectorAll('#mobileNavDrawer .nav-link, #mobileNavDrawer .mobile-sector-btn');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mobileNavDrawer) mobileNavDrawer.classList.remove('active');
    });
  });

  // 2. FAQ Accordion Toggle
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const isActive = item.classList.contains('active');
      
      // Close all accordion items first
      document.querySelectorAll('.accordion-item').forEach(i => {
        i.classList.remove('active');
      });
      
      // If it wasn't active before, open it
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // 3. Process Steps Interaction
  const stepRows = document.querySelectorAll('.step-row');
  stepRows.forEach(step => {
    step.addEventListener('mouseenter', () => {
      stepRows.forEach(s => s.classList.remove('active'));
      step.classList.add('active');
    });
  });

  // 4. Portfolio Category & Sector Filtering
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card');
  const sectorGridTitle = document.getElementById('sectorGridTitle');

  const filterCards = (filterValue, sectorNum = null) => {
    portfolioCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category');
      const cardSector = card.getAttribute('data-sector');

      if (sectorNum) {
        if (cardSector === sectorNum) {
          card.style.display = 'block';
          card.style.opacity = '1';
          card.style.border = '2px solid var(--gold-accent)';
        } else {
          card.style.display = 'none';
          card.style.opacity = '0';
          card.style.border = '1px solid var(--border-color)';
        }
      } else {
        card.style.border = '1px solid var(--border-color)';
        if (filterValue === 'all' || cardCategory === filterValue) {
          card.style.display = 'block';
          card.style.opacity = '1';
        } else {
          card.style.display = 'none';
          card.style.opacity = '0';
        }
      }
    });
  };

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filterValue = btn.getAttribute('data-filter');
      if (sectorGridTitle) sectorGridTitle.textContent = filterValue === 'all' ? 'Sectors Overview (1 – 9)' : `Category: ${btn.textContent}`;
      filterCards(filterValue);
    });
  });

  // Handle URL sector parameter (e.g. portfolio.html?sector=5)
  const urlParams = new URLSearchParams(window.location.search);
  const sectorParam = urlParams.get('sector');

  if (sectorParam && portfolioCards.length > 0) {
    if (sectorGridTitle) sectorGridTitle.textContent = `Displaying Sector ${sectorParam}`;
    filterCards('all', sectorParam);
    const targetCard = document.getElementById(`sector-${sectorParam}`);
    if (targetCard) {
      setTimeout(() => {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }

  // Supabase Configuration
  const SUPABASE_URL = 'https://mgiaanbgqtpfiesdudsz.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1naWFhbmJncXRwZmllc2R1ZHN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4NjM4OTksImV4cCI6MjEwMDQzOTg5OX0.bPR110kslaUsOSd5AydrYaYMj1jHcRv_JRDPmIZky68';

  let supabaseClient = null;
  if (typeof supabase !== 'undefined' && SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  const enquiryForm = document.getElementById('enquiryForm');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalClose = document.getElementById('modalClose');
  const modalDossierRef = document.getElementById('modalDossierRef');

  if (enquiryForm) {
    enquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = enquiryForm.querySelector('[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Send Enquiry to Bureau';
      if (submitBtn) {
        submitBtn.innerHTML = 'Sending Enquiry & Documents...';
        submitBtn.style.opacity = '0.7';
        submitBtn.disabled = true;
      }

      const firstName = document.getElementById('firstName')?.value || '';
      const lastName = document.getElementById('lastName')?.value || '';
      const email = document.getElementById('email')?.value || '';
      const phone = document.getElementById('phone')?.value || '';
      const category = document.getElementById('category')?.value || '';
      const message = document.getElementById('enquiryMsg')?.value || '';

      // 1. Save user info to Supabase Database
      if (supabaseClient) {
        try {
          await supabaseClient
            .from('enquiries')
            .insert([
              {
                first_name: firstName,
                last_name: lastName,
                email: email,
                phone: phone,
                category: category,
                message: message,
                created_at: new Date().toISOString()
              }
            ]);
          console.log('User info saved to Supabase successfully.');
        } catch (err) {
          console.error('Supabase Save Error:', err);
        }
      }

      // 2. Send email with documents via FormSubmit AJAX
      try {
        const formData = new FormData(enquiryForm);
        formData.append('_subject', `New Dossier Enquiry from ${firstName} ${lastName}`);
        formData.append('_captcha', 'false');
        formData.append('_template', 'table');

        const response = await fetch('https://formsubmit.co/ajax/sanand@sandsprings.in', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();
        console.log('FormSubmit Response:', data);

        // 3. Show Success Modal with Reference Code
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        if (modalDossierRef) {
          modalDossierRef.textContent = `DSKL-2026-${randomNum}`;
        }
        if (modalOverlay) {
          modalOverlay.classList.add('active');
        }

        // Reset form and file upload preview
        enquiryForm.reset();
        if (typeof removeFile === 'function') removeFile();

      } catch (err) {
        console.error('Email Dispatch Error:', err);
        alert('Enquiry registered in database. If you experience email delay, please click "Send Document via WhatsApp" for instant submission.');
      } finally {
        if (submitBtn) {
          submitBtn.innerHTML = originalBtnText;
          submitBtn.style.opacity = '1';
          submitBtn.disabled = false;
        }
      }
    });
  }

  if (modalClose && modalOverlay) {
    modalClose.addEventListener('click', () => {
      modalOverlay.classList.remove('active');
    });

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
      }
    });
  }

  // 6. Scroll Reveal Observer
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const revealElements = document.querySelectorAll('.manifesto-card, .step-row, .portfolio-card, .testimonial-card, .accordion-item');
  
  revealElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    revealObserver.observe(el);
  });
  // 7. File Upload Drop Zone drag events
  const fileWrap = document.getElementById('fileUploadWrap');
  if (fileWrap) {
    fileWrap.addEventListener('dragover', (e) => {
      e.preventDefault();
      fileWrap.querySelector('.file-upload-label').style.borderColor = 'var(--gold-accent)';
      fileWrap.querySelector('.file-upload-label').style.background = '#FAF7EF';
    });
    fileWrap.addEventListener('dragleave', () => {
      fileWrap.querySelector('.file-upload-label').style.borderColor = '';
      fileWrap.querySelector('.file-upload-label').style.background = '';
    });
    fileWrap.addEventListener('drop', (e) => {
      e.preventDefault();
      const input = document.getElementById('docUpload');
      if (input && e.dataTransfer.files.length) {
        input.files = e.dataTransfer.files;
        handleFileSelect(input);
      }
    });
  }
});

/* ==========================================================================
   File Upload: Global handlers (called from inline HTML attributes)
   ========================================================================== */

function handleFileSelect(input) {
  const label = document.getElementById('fileUploadLabel');
  const badge = document.getElementById('fileSelectedBadge');
  const nameSpan = document.getElementById('fileSelectedName');

  if (input.files && input.files.length > 0) {
    if (label) label.style.display = 'none';
    if (badge) {
      badge.style.display = 'flex';
      if (nameSpan) {
        if (input.files.length === 1) {
          nameSpan.textContent = input.files[0].name;
        } else {
          const names = Array.from(input.files).map(f => f.name).join(', ');
          nameSpan.textContent = `${input.files.length} documents selected (${names})`;
        }
      }
    }
  }
}

function removeFile() {
  const input = document.getElementById('docUpload');
  const label = document.getElementById('fileUploadLabel');
  const badge = document.getElementById('fileSelectedBadge');

  if (input) input.value = '';
  if (label) label.style.display = 'flex';
  if (badge) badge.style.display = 'none';
}
