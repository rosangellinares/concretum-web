(function () {
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;
  if (!('IntersectionObserver' in window)) return;

  // Baja por cadenas de envoltorios de un solo hijo hasta encontrar el punto
  // donde una sección realmente se ramifica en varios bloques (tarjetas,
  // fotos, items de una lista). Así cada bloque anima por separado, en vez
  // de que toda la sección aparezca de golpe como una diapositiva.
  function findRevealUnits(section) {
    var node = section;
    while (node.children.length === 1) {
      node = node.children[0];
    }
    return node.children.length > 1 ? Array.from(node.children) : [section];
  }

  var targets = [];
  document.querySelectorAll('main').forEach(function (main) {
    main.querySelectorAll('section').forEach(function (section, index) {
      if (index === 0) return; // deja el hero visible desde el primer pintado
      findRevealUnits(section).forEach(function (unit, i) {
        unit.classList.add('co-reveal');
        unit.style.transitionDelay = Math.min(i * 70, 280) + 'ms';
        targets.push(unit);
      });
    });
  });

  if (!targets.length) return;

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('co-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0, rootMargin: '0px 0px -80px 0px' }
  );

  targets.forEach(function (target) {
    observer.observe(target);
  });
})();
