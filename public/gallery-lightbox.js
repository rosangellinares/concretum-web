(function () {
  var galleries = document.querySelectorAll('[data-gallery]');
  var lightbox = document.getElementById('co-lightbox');
  if (!galleries.length || !lightbox) return;

  var lightboxImg = lightbox.querySelector('img');
  var prevBtn = lightbox.querySelector('.co-lightbox-prev');
  var nextBtn = lightbox.querySelector('.co-lightbox-next');
  var closeBtn = lightbox.querySelector('.co-lightbox-close');

  var images = [];
  var current = 0;

  function show() {
    var img = images[current];
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    var multi = images.length > 1;
    prevBtn.style.display = multi ? '' : 'none';
    nextBtn.style.display = multi ? '' : 'none';
  }

  function open(imgs, index) {
    images = imgs;
    current = index;
    show();
    lightbox.classList.add('co-open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('co-open');
    document.body.style.overflow = '';
  }

  function prev() {
    current = (current - 1 + images.length) % images.length;
    show();
  }

  function next() {
    current = (current + 1) % images.length;
    show();
  }

  galleries.forEach(function (gallery) {
    var imgs = Array.from(gallery.querySelectorAll('img'));
    imgs.forEach(function (img, i) {
      img.addEventListener('click', function () {
        open(imgs, i);
      });
    });
  });

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) close();
  });
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('co-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });
})();
