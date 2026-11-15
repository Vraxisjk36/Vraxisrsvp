
      (function () {
        var intro = document.getElementById("vraxisOpening");
        var button = document.getElementById("vraxisOpeningEnter");
        if (!intro || !button) return;
        var old = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        button.addEventListener(
          "click",
          function () {
            intro.classList.add("dismissed");
            document.body.style.overflow = old;
            setTimeout(function () {
              intro.remove();
            }, 900);
          },
          { once: true },
        );
      })();
    