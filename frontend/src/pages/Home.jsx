import React, { useEffect, useRef, useState } from "react";

const features = [
  {
    title: "Real Projects",
    description:
      "Work on practical, portfolio-worthy projects with real business impact from day one.",
  },
  {
    title: "Mentorship",
    description:
      "Get guided by experienced professionals through structured feedback and 1:1 support.",
  },
  {
    title: "Career Growth",
    description:
      "Build industry-relevant skills, expand your network, and accelerate your career path.",
  },
];

function DarkModeToggle({ darkMode, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle dark mode"
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-white/25 dark:border-slate-600 dark:bg-slate-800 dark:text-yellow-300 dark:hover:bg-slate-700"
    >
      <span className="text-lg" aria-hidden="true">
        {darkMode ? "☀" : "🌙"}
      </span>
    </button>
  );
}

function FeatureCard({ title, description, visible, index }) {
  return (
    <article
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl dark:border-slate-700 dark:bg-slate-800 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
      }`}
      style={{ transitionDelay: `${index * 130}ms` }}
    >
      <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {description}
      </p>
    </article>
  );
}

function ScrollImage({ visible }) {
  return (
    <div
      className={`mx-auto mt-12 max-w-5xl overflow-hidden rounded-2xl shadow-2xl transition-all duration-700 ease-out hover:-translate-y-1 hover:shadow-3xl ${
        visible
          ? "translate-y-0 scale-100 opacity-100"
          : "translate-y-12 scale-95 opacity-0"
      }`}
    >
      <img
        src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80"
        alt="Team collaborating on internship projects"
        className="h-64 w-full object-cover transition-transform duration-300 hover:scale-105 sm:h-80 lg:h-[420px]"
        loading="lazy"
      />
    </div>
  );
}

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);
  const [imageVisible, setImageVisible] = useState(false);

  const cardsRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setDarkMode(storedTheme === "dark");
      return;
    }
    setDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const target = cardsRef.current;
    if (!target) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCardsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const target = imageRef.current;
    if (!target) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <main className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-500 dark:bg-slate-900 dark:text-slate-100">
        <section
          className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cover bg-center px-4 py-16 sm:px-6 lg:px-8"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1800&q=80')",
          }}
        >
          <div
            className={`absolute inset-0 transition-colors duration-300 ${
              darkMode ? "bg-black/65" : "bg-black/50"
            }`}
          />
          <nav className="absolute left-0 top-0 z-20 w-full px-4 py-4 sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
              <div className="text-lg font-extrabold text-white sm:text-xl">
                NatijaHub
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <button className="rounded-lg border border-white/60 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-white/20 sm:text-sm">
                  Explore Internships
                </button>
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition-all duration-200 hover:scale-105 hover:bg-blue-700 hover:shadow-xl sm:text-sm">
                  Our Services
                </button>
              </div>
            </div>
          </nav>
          <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
            <DarkModeToggle
              darkMode={darkMode}
              onToggle={() => setDarkMode((prev) => !prev)}
            />
          </div>

          <div className="relative z-10 mx-auto max-w-4xl text-center text-white">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              NatijaHub talabaning vakansiyagacha bo'lgan yo'lini quradi.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base md:text-lg">
              Discover internships, mentorship, and hands-on opportunities that
              help students move confidently from learning to employment.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button className="w-full rounded-xl bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:scale-105 hover:bg-blue-700 hover:shadow-xl active:scale-95 sm:w-auto sm:text-base">
                Explore Internships
              </button>
              <button className="w-full rounded-xl border border-white/70 bg-white/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-white/20 hover:shadow-lg active:scale-95 sm:w-auto sm:text-base">
                Our Services
              </button>
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-2xl font-bold sm:text-3xl lg:text-4xl">
              Why join us?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-slate-600 dark:text-slate-300 sm:text-base">
              We support ambitious students with practical experience and a clear
              path to career growth.
            </p>

            <div
              ref={cardsRef}
              className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {features.map((feature, index) => (
                <FeatureCard
                  key={feature.title}
                  title={feature.title}
                  description={feature.description}
                  visible={cardsVisible}
                  index={index}
                />
              ))}
            </div>

            <div ref={imageRef}>
              <ScrollImage visible={imageVisible} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
