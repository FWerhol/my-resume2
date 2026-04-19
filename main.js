(function () {
    "use strict";

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var revealEls = document.querySelectorAll("[data-reveal]");
    var dockLinks = document.querySelectorAll(".dock__link");
    var navLinks = document.querySelectorAll(".topbar__link[href^='#']");
    var anchorSections = document.querySelectorAll(".anchor-section");
    var sections = document.querySelectorAll("main section[id]");
    var spotlightCards = document.querySelectorAll("[data-spotlight]");
    var glassPanels = document.querySelectorAll(".glass-panel");
    var photo = document.querySelector(".hero-media__portrait .hero-portrait-img");
    if (photo) {
        photo.addEventListener("error", function () {
            photo.remove();
        });
    }

    /* Scroll reveal */
    if (!reduceMotion && "IntersectionObserver" in window && revealEls.length) {
        var io = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (e) {
                    if (e.isIntersecting) {
                        e.target.classList.add("is-visible");
                        io.unobserve(e.target);
                    }
                });
            },
            { root: null, rootMargin: "0px 0px -6% 0px", threshold: 0.08 }
        );
        revealEls.forEach(function (el) {
            io.observe(el);
        });
    } else {
        revealEls.forEach(function (el) {
            el.classList.add("is-visible");
        });
    }

    /* Panel mount animation (Animate UI inspired, lightweight) */
    if (!reduceMotion && "IntersectionObserver" in window && glassPanels.length) {
        var panelObserver = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-mounted");
                        panelObserver.unobserve(entry.target);
                    }
                });
            },
            { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
        );
        glassPanels.forEach(function (panel) {
            panelObserver.observe(panel);
        });
    } else {
        glassPanels.forEach(function (panel) {
            panel.classList.add("is-mounted");
        });
    }

    /* Активный пункт верхнего меню по якорям */
    function setActiveNav() {
        if (!navLinks.length || !anchorSections.length) return;
        var scrollBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 48;
        var current = anchorSections[0].id;

        if (window.scrollY < 56) {
            navLinks.forEach(function (a) {
                a.classList.remove("is-active");
            });
            return;
        }

        if (scrollBottom) {
            var li = anchorSections.length - 1;
            while (li >= 0 && anchorSections[li].hasAttribute("hidden")) {
                li -= 1;
            }
            current = li >= 0 ? anchorSections[li].id : current;
        } else {
            var threshold = Math.min(window.innerHeight * 0.26, 200);
            anchorSections.forEach(function (sec) {
                if (sec.hasAttribute("hidden")) return;
                if (sec.getBoundingClientRect().top <= threshold) {
                    current = sec.id;
                }
            });
        }

        navLinks.forEach(function (a) {
            var href = a.getAttribute("href");
            var id = href && href.charAt(0) === "#" ? href.slice(1) : "";
            a.classList.toggle("is-active", id === current);
        });
    }

    function setActiveSection() {
        if (!dockLinks.length || !sections.length) return;
        var doc = document.documentElement;
        var nearBottom = window.scrollY + window.innerHeight >= doc.scrollHeight - 64;
        var current = sections.length && sections[0].id ? sections[0].id : "home";

        if (nearBottom && sections.length) {
            current = sections[sections.length - 1].id;
        } else {
            var mid = window.innerHeight * 0.35;
            sections.forEach(function (sec) {
                var r = sec.getBoundingClientRect();
                if (r.top <= mid && r.bottom >= mid) {
                    current = sec.id;
                }
            });
        }

        dockLinks.forEach(function (a) {
            a.classList.toggle("is-active", a.getAttribute("href") === "#" + current);
        });
    }

    if (navLinks.length) {
        setActiveNav();
        navLinks.forEach(function (a) {
            a.addEventListener("click", function () {
                window.setTimeout(setActiveNav, 320);
            });
        });
    }

    if (dockLinks.length) {
        setActiveSection();
        dockLinks.forEach(function (a) {
            a.addEventListener("click", function () {
                window.setTimeout(setActiveSection, 350);
            });
        });
    }

    /* Spotlight: один кадр на движение — меньше нагрузки при движении мыши */
    spotlightCards.forEach(function (card) {
        var spotPending = false;
        var lx = 0;
        var ly = 0;
        card.addEventListener("pointermove", function (e) {
            lx = e.clientX;
            ly = e.clientY;
            if (spotPending) return;
            spotPending = true;
            window.requestAnimationFrame(function () {
                spotPending = false;
                var r = card.getBoundingClientRect();
                var x = ((lx - r.left) / r.width) * 100;
                var y = ((ly - r.top) / r.height) * 100;
                card.style.setProperty("--mx", x + "%");
                card.style.setProperty("--my", y + "%");
            });
        });
        card.addEventListener("pointerleave", function () {
            card.style.removeProperty("--mx");
            card.style.removeProperty("--my");
        });
    });

    var boardEl = document.querySelector("[data-board]");
    var roadmapSteps = document.querySelectorAll(".board-roadmap__step");

    function updateRoadmapProgress() {
        if (!boardEl) return;
        var rect = boardEl.getBoundingClientRect();
        var boardTop = window.scrollY + rect.top;
        var boardH = boardEl.offsetHeight;
        var vh = window.innerHeight;
        var probe = window.scrollY + vh * 0.34;
        var span = Math.max(boardH - vh * 0.2, 120);
        var p = (probe - boardTop) / span;
        p = Math.min(Math.max(p, 0), 1);
        boardEl.style.setProperty("--road-progress", p.toFixed(4));
    }

    function updateRoadmapActive() {
        if (!roadmapSteps.length || !anchorSections.length) return;
        var threshold = Math.min(window.innerHeight * 0.36, 240);
        var currentId = anchorSections[0].id;
        if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 40) {
            var ri = anchorSections.length - 1;
            while (ri >= 0 && anchorSections[ri].hasAttribute("hidden")) {
                ri -= 1;
            }
            currentId = ri >= 0 ? anchorSections[ri].id : currentId;
        } else {
            anchorSections.forEach(function (sec) {
                if (sec.hasAttribute("hidden")) return;
                if (sec.getBoundingClientRect().top <= threshold) {
                    currentId = sec.id;
                }
            });
        }
        roadmapSteps.forEach(function (a) {
            var href = a.getAttribute("href");
            var id = href && href.charAt(0) === "#" ? href.slice(1) : "";
            a.classList.toggle("is-active", id === currentId);
        });
    }

    var scrollRaf = null;
    var runScrollEffects = function () {
        setActiveNav();
        setActiveSection();
        updateRoadmapProgress();
        updateRoadmapActive();
        scrollRaf = null;
    };

    var onScrollOrResize = function () {
        if (scrollRaf !== null) return;
        scrollRaf = window.requestAnimationFrame(runScrollEffects);
    };

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    onScrollOrResize();

    /* Заявка: открытие формы и плавный скролл */
    var BRIEF_COPY = {
        project: {
            title: "Обсудить проект",
            intro:
                "Расскажите в двух словах о продукте или сайте — подготовлю варианты сроков и формата работы.",
            msgLabel: "Сообщение",
            placeholder: "Цели, аудитория, референсы, дедлайн…"
        },
        landing: {
            title: "Лендинг под ключ",
            intro: "Опишите макет и желаемый интерактив: оценю объём и предложу следующий шаг.",
            msgLabel: "О лендинге",
            placeholder: "Figma, CMS, формы, аналитика, срок запуска…"
        },
        task: {
            title: "Доработка или задача",
            intro:
                "Что уже есть на сайте и что нужно изменить или добавить — приложите ссылки и скриншоты по возможности.",
            msgLabel: "О задаче",
            placeholder: "Стек, репозиторий, ТЗ, ожидаемый результат…"
        },
        brief: {
            title: "Запросить бриф",
            intro: "Нужен разбор до старта работ: опишите запрос — предложу формат консультации.",
            msgLabel: "Запрос",
            placeholder: "Контекст, вопросы, удобное время для связи…"
        }
    };

    var CONTACT_EMAIL = "dima.fergert@mail.ru";

    function openMailtoUrl(href) {
        var a = document.createElement("a");
        a.href = href;
        a.rel = "noopener noreferrer";
        a.target = "_self";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    var briefRoot = document.getElementById("brief");
    var briefHeading = document.getElementById("brief-heading");
    var briefIntro = document.getElementById("brief-intro");
    var briefTopicEl = document.getElementById("brief-topic");
    var briefMsgLabel = document.getElementById("brief-msg-label");
    var briefMessageEl = document.getElementById("brief-message");
    var briefFormEl = document.getElementById("brief-form");

    function applyBriefCopy(type) {
        var c = BRIEF_COPY[type] || BRIEF_COPY.project;
        if (briefHeading) briefHeading.textContent = c.title;
        if (briefIntro) briefIntro.textContent = c.intro;
        if (briefTopicEl) briefTopicEl.value = type;
        if (briefMsgLabel) briefMsgLabel.textContent = c.msgLabel;
        if (briefMessageEl) briefMessageEl.placeholder = c.placeholder;
    }

    function openBrief(type) {
        if (!briefRoot) return;
        applyBriefCopy(type || "project");
        briefRoot.removeAttribute("hidden");
        briefRoot.classList.add("is-visible", "brief-section--open");

        var behavior = reduceMotion ? "auto" : "smooth";
        window.requestAnimationFrame(function () {
            briefRoot.scrollIntoView({
                behavior: behavior,
                block: "start",
                inline: "nearest"
            });
        });

        /* Не пишем #brief в URL — иначе при F5 браузер снова прыгает к заявке */

        var firstInput = document.getElementById("brief-name");
        var focusDelay = reduceMotion ? 50 : 560;
        window.setTimeout(function () {
            if (firstInput && typeof firstInput.focus === "function") {
                try {
                    firstInput.focus({ preventScroll: true });
                } catch (ignore) {
                    firstInput.focus();
                }
            }
            updateRoadmapProgress();
            updateRoadmapActive();
            setActiveNav();
        }, focusDelay);
    }

    document.querySelectorAll("[data-open-brief]").forEach(function (el) {
        el.addEventListener("click", function (e) {
            var href = el.getAttribute("href");
            if (href === "#brief") {
                e.preventDefault();
            }
            openBrief(el.getAttribute("data-open-brief") || "project");
        });
    });

    if (briefFormEl) {
        briefFormEl.addEventListener("submit", function (e) {
            e.preventDefault();
            var fd = new FormData(briefFormEl);
            var name = (fd.get("name") || "").toString().trim();
            var contact = (fd.get("contact") || "").toString().trim();
            var message = (fd.get("message") || "").toString().trim();
            var meta = (fd.get("meta") || "").toString().trim();
            var topic = (briefTopicEl && briefTopicEl.value) || "project";
            var subj = "[Заявка: " + topic + "] " + (name || "без имени");
            var body = "Тема: " + topic + "\n\nИмя: " + name + "\nКонтакт: " + contact + "\n\n" + message;
            if (meta) {
                body += "\n\nСрок / бюджет: " + meta;
            }
            var mailtoHref =
                "mailto:" +
                CONTACT_EMAIL +
                "?subject=" +
                encodeURIComponent(subj) +
                "&body=" +
                encodeURIComponent(body);
            openMailtoUrl(mailtoHref);
        });
    }

    function tryOpenBriefFromHash() {
        if (window.location.hash !== "#brief" || !briefRoot) return;
        if (!briefRoot.hasAttribute("hidden")) return;
        openBrief("project");
    }

    window.addEventListener("hashchange", tryOpenBriefFromHash);
    tryOpenBriefFromHash();

    /* Копирование почты: если нет клиента, всё равно можно вставить адрес */
    var copyToast = document.getElementById("contact-copy-toast");
    document.querySelectorAll("[data-copy-email]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            var email = (btn.getAttribute("data-copy-email") || "").trim();
            if (!email) return;
            function showToast(msg) {
                if (!copyToast) {
                    window.alert(msg);
                    return;
                }
                copyToast.textContent = msg;
                copyToast.hidden = false;
                window.clearTimeout(showToast._t);
                showToast._t = window.setTimeout(function () {
                    copyToast.hidden = true;
                    copyToast.textContent = "";
                }, 2400);
            }
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(email).then(function () {
                    showToast("Адрес скопирован в буфер.");
                }).catch(function () {
                    showToast(email);
                });
            } else {
                showToast(email);
            }
        });
    });
})();
