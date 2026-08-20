import { type ReactNode, useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircuitBoard,
  ExternalLink,
  Mail,
  Maximize2,
  Menu,
  MoveUpRight,
  X,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import schematicImage from '@assets/image-9c8f448d-ebc3-4d07-9ed9-de0a30a64cad_1787178496935.png';
import layoutImage from '@assets/image-37d06da9-ab7d-445e-8187-565c1d2f5ef8_1787178501631.png';
import modelImage from '@assets/image-1afcb48c-0b02-46d9-832c-f01ff533c470_1787178492486.png';
import hardwareImage from '@assets/image-66100a1c-b435-438e-a237-dc1894d93ecd_1787178505773.png';

const queryClient = new QueryClient();

type ProjectImage = {
  src: string;
  alt: string;
  label: string;
};

const projectImages: Record<string, ProjectImage> = {
  schematic: {
    src: schematicImage,
    alt: 'Altium schematic for an ESP32-S3 development board with USB-C, USB to UART, power, buttons, LED, LCD header, and debug header circuits.',
    label: 'Altium schematic',
  },
  layout: {
    src: layoutImage,
    alt: 'Altium PCB layout showing routed red and blue traces, component footprints, board outline, and ESP32-S3 module placement.',
    label: 'PCB routing',
  },
  model: {
    src: modelImage,
    alt: 'Altium 3D render of the green custom ESP32-S3 board with USB-C, buttons, headers, antenna module, and labeled components.',
    label: '3D board model',
  },
  hardware: {
    src: hardwareImage,
    alt: 'Manufactured custom ESP32-S3 development board connected to a 1.3 inch LCD, displaying an image during hardware bring-up.',
    label: 'Hardware bring-up',
  },
};

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, className: visible ? 'reveal is-visible' : 'reveal' };
}

function ImageButton({
  image,
  onOpen,
  className = '',
}: {
  image: ProjectImage;
  onOpen: (image: ProjectImage) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`image-frame group relative block w-full overflow-hidden rounded-[1.4rem] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#66a48f] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f6f3eb] ${className}`}
      onClick={() => onOpen(image)}
      data-testid={`button-expand-${image.label.toLowerCase().replaceAll(' ', '-')}`}
      aria-label={`Expand ${image.label}`}
    >
      <img src={image.src} alt={image.alt} className="block h-full w-full object-contain" loading="lazy" />
      <span className="pointer-events-none absolute inset-x-4 bottom-4 flex items-center justify-between rounded-full border border-white/30 bg-[#173c39]/75 px-4 py-2 text-[11px] text-[#f6f3eb] opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
        <span className="font-mono uppercase tracking-[0.12em]">{image.label}</span>
        <Maximize2 size={14} strokeWidth={1.5} />
      </span>
    </button>
  );
}

function ProjectLinkCard({ image }: { image: ProjectImage }) {
  return (
    <a
      href="/projects"
      className="image-frame group relative block w-full overflow-hidden rounded-[1.4rem] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#66a48f] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f6f3eb]"
      aria-label="View the Custom ESP32-S3 Development Board project"
      data-testid="link-hero-board"
    >
      <img
        src={image.src}
        alt={image.alt}
        className="block h-full w-full object-contain"
      />
    </a>
  );
}

function Lightbox({ image, onClose }: { image: ProjectImage | null; onClose: () => void }) {
  useEffect(() => {
    if (!image) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [image, onClose]);

  if (!image) return null;
  return (
    <div
      className="lightbox-backdrop fixed inset-0 z-50 flex items-center justify-center bg-[#102e2b]/90 p-4 backdrop-blur-xl sm:p-10"
      role="dialog"
      aria-modal="true"
      aria-label={`${image.label} expanded view`}
      onClick={onClose}
      data-testid="lightbox-overlay"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-5 top-5 z-10 rounded-full border border-[#dce9df]/30 bg-[#173c39]/80 p-3 text-[#f6f3eb] transition-colors hover:bg-[#66a48f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dce9df]"
        aria-label="Close expanded image"
        data-testid="button-close-lightbox"
      >
        <X size={19} strokeWidth={1.5} />
      </button>
      <figure className="relative max-h-full max-w-6xl" onClick={(event) => event.stopPropagation()}>
        <img src={image.src} alt={image.alt} className="max-h-[82vh] w-auto max-w-full rounded-xl object-contain shadow-2xl" />
        <figcaption className="mt-4 flex items-center justify-between text-xs text-[#dce9df]/75">
          <span className="font-mono uppercase tracking-[0.16em]">{image.label}</span>
          <span>Press Esc to close</span>
        </figcaption>
      </figure>
    </div>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const links = [
    { href: '/projects', label: 'Projects' },
    { href: '/#about', label: 'About' },
    { href: '/#contact', label: 'Contact' },
  ];
  const handleNav = () => setOpen(false);
  return (
    <header className="fixed inset-x-0 top-0 z-40 px-4 pt-4 sm:px-6 lg:px-8">
      <nav className="mx-auto flex max-w-[1360px] items-center justify-between rounded-full border border-[#b9c5b9]/60 bg-[#f6f3eb]/80 px-4 py-3 shadow-[0_8px_28px_rgba(31,58,54,0.06)] backdrop-blur-xl sm:px-5" aria-label="Primary navigation">
        <a href="/" onClick={handleNav} className="flex items-center gap-2.5" data-testid="link-home">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[#20534e] text-[#f6f3eb]">
            <CircuitBoard size={14} strokeWidth={1.5} />
          </span>
          <span className="text-sm font-semibold tracking-[-0.03em] text-[#173c39]">Markus Tai</span>
        </a>
        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-semibold text-[#355c55] transition-colors hover:text-[#173c39]" data-testid={`link-nav-${link.label.toLowerCase()}`}>
              {link.label}
            </a>
          ))}
          <a href="mailto:markust0112@gmail.com" className="inline-flex items-center gap-2 rounded-full bg-[#20534e] px-4 py-2 text-sm font-semibold text-[#f6f3eb] transition-transform hover:-translate-y-0.5" data-testid="link-nav-email">
            Say hello <ArrowUpRight size={14} strokeWidth={1.7} />
          </a>
        </div>
        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-full border border-[#b9c5b9] text-[#20534e] md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          data-testid="button-mobile-menu"
        >
          {open ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
        </button>
      </nav>
      {open && (
        <div className="mx-auto mt-2 max-w-[1360px] rounded-3xl border border-[#b9c5b9]/60 bg-[#f6f3eb]/95 p-3 shadow-lg backdrop-blur-xl md:hidden">
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={handleNav} className="block rounded-2xl px-4 py-3 text-sm font-semibold text-[#20534e] hover:bg-[#e8eee7]" data-testid={`link-mobile-${link.label.toLowerCase()}`}>
              {link.label}
            </a>
          ))}
          <a href="mailto:markust0112@gmail.com" onClick={handleNav} className="mt-1 flex items-center justify-between rounded-2xl bg-[#20534e] px-4 py-3 text-sm font-semibold text-[#f6f3eb]" data-testid="link-mobile-email">
            Say hello <ArrowUpRight size={16} strokeWidth={1.5} />
          </a>
        </div>
      )}
    </header>
  );
}

function Hero() {
  const reveal = useReveal();
  return (
    <section id="top" className="relative mx-auto flex min-h-[100svh] max-w-[1360px] flex-col justify-center px-5 pb-16 pt-28 sm:px-8 sm:pb-20 lg:min-h-[760px] lg:justify-end lg:px-16 lg:pb-24">
      <div className="hero-grid pointer-events-none absolute inset-0 -z-0 opacity-70" />
      <div className="relative z-10">
        <div ref={reveal.ref} className={`${reveal.className} hero-reveal`}>
          <div className="mb-8 flex items-center gap-3 text-[#668079]">
            <span className="h-px w-9 bg-[#66a48f]" />
            <span className="eyebrow">Electrical engineering</span>
          </div>
          <h1 className="max-w-4xl text-[clamp(3.9rem,11vw,9.2rem)] font-extrabold leading-[0.86] tracking-[-0.085em] text-[#173c39]">
            Hey, I&apos;m
            <br />
            <span className="text-[#66a48f]">Markus.</span>
          </h1>
          <p className="mt-9 max-w-md text-lg leading-8 text-[#355c55] sm:text-xl">
            I&apos;m a second-year Electrical Engineering student at UBC interested in hardware, embedded systems, and PCB design.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a href="/projects" className="group inline-flex items-center gap-3 rounded-full bg-[#20534e] px-5 py-3.5 text-sm font-semibold text-[#f6f3eb] transition-transform hover:-translate-y-1" data-testid="link-hero-project">
              View my work <ArrowDownRight size={17} strokeWidth={1.5} className="transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
            </a>
            <a href="#about" className="inline-flex items-center gap-2 px-2 py-3.5 text-sm font-semibold text-[#20534e] hover:text-[#66a48f]" data-testid="link-hero-about">
              About me <ChevronRight size={16} strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function About() {
  const reveal = useReveal();

  return (
    <section
      id="about"
      className="mx-auto max-w-[1360px] px-5 py-24 sm:px-8 lg:px-16 lg:py-32"
    >
      <div ref={reveal.ref} className={reveal.className}>
        <p className="text-sm font-mono uppercase tracking-[0.14em] text-[#66a48f]">
          About me
        </p>

        <h2 className="mt-5 max-w-2xl text-3xl font-medium leading-tight tracking-[-0.03em] text-[#173c39] sm:text-4xl">
          I like building things that bridge hardware and software.
        </h2>

        <div className="mt-8 max-w-2xl space-y-5 text-[17px] leading-8 text-[#355c55] sm:text-[18px]">
          <p>
            I&apos;m a second-year Electrical Engineering student at UBC
            interested in embedded systems, electronics, and PCB design. I
            enjoy learning through hands-on projects and turning ideas into
            working hardware.
          </p>

          <p>
            Outside of school, I enjoy going to the gym, playing sports, and
            staying active.
          </p>
        </div>
      </div>
    </section>
  );
}
function HomeProjects() {
  const reveal = useReveal();
  return (
    <section id="projects" className="border-t border-[#c5d5c8] bg-gradient-to-br from-[#edf1e9] via-[#e5ece3] to-[#dce9df]">
      <div ref={reveal.ref} className={`${reveal.className} mx-auto grid max-w-[1360px] gap-8 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20 lg:px-16 lg:py-24`}>
        <div>
          <span className="eyebrow text-[#4b6961]">Projects</span>
          <h2 className="mt-5 max-w-sm text-5xl font-bold leading-[0.92] tracking-[-0.07em] text-[#173c39] sm:text-6xl">Selected work.</h2>
          <div className="mt-10 max-w-xl">
            <div className="relative">
              <div className="absolute -inset-5 -z-10 rounded-[2rem] bg-[#dce9df]/45 blur-2xl" />
              <ProjectLinkCard image={projectImages.model} />
              <div className="absolute -bottom-5 -left-3 rounded-2xl border border-[#b9c5b9]/60 bg-[#f6f3eb]/90 px-4 py-3 shadow-[0_12px_30px_rgba(31,58,54,0.08)] backdrop-blur-md sm:-left-5">
                <span className="eyebrow text-[#668079]">Selected build</span>
                <p className="mt-1 text-sm font-semibold tracking-[-0.02em] text-[#20534e]">Custom ESP32-S3 board</p>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-2xl">
          <p className="text-[18px] leading-8 text-[#355c55] sm:text-xl">
            A custom ESP32-S3 development board designed to power and communicate with an LCD module, then manufactured and tested.
          </p>
          <a href="/projects" className="group mt-8 inline-flex items-center gap-3 rounded-full bg-[#20534e] px-5 py-3.5 text-base font-semibold text-[#f6f3eb] transition-transform hover:-translate-y-1" data-testid="link-home-projects">
            View project <ArrowUpRight size={17} strokeWidth={1.5} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}

function ProjectSection({
  number,
  kicker,
  children,
  image,
  imageSide = 'right',
  onOpen,
  dark = false,
}: {
  number: string;
  kicker: string;
  children: ReactNode;
  image?: ProjectImage;
  imageSide?: 'left' | 'right';
  onOpen: (image: ProjectImage) => void;
  dark?: boolean;
}) {
  const reveal = useReveal();
  return (
    <article className={`${dark ? 'bg-[#173c39] text-[#f6f3eb]' : 'bg-[#f6f3eb] text-[#173c39]'} border-t ${dark ? 'border-[#38665f]' : 'border-[#d4dbd1]'}`}>
      <div ref={reveal.ref} className={`${reveal.className} mx-auto grid max-w-[1360px] items-center gap-12 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-2 lg:gap-24 lg:px-16 lg:py-40 ${imageSide === 'left' ? 'lg:[&>*:first-child]:order-2' : ''}`}>
        <div className="max-w-xl">
          <div className={`mb-8 flex items-center gap-4 ${dark ? 'text-[#a6c9b2]' : 'text-[#668079]'}`}>
            <span className="font-mono text-xs">{number}</span>
            <span className={`h-px w-12 ${dark ? 'bg-[#66a48f]' : 'bg-[#b9c5b9]'}`} />
            <span className="eyebrow">{kicker}</span>
          </div>
          <div className={`mt-7 max-w-lg text-[17px] leading-8 ${dark ? 'text-[#c1d6c9]' : 'text-[#355c55]'}`}>{children}</div>
        </div>
        {image && (
          <ImageButton image={image} onOpen={onOpen} className={`aspect-[1.35] ${dark ? 'ring-1 ring-[#7ea795]/30' : ''}`} />
        )}
      </div>
    </article>
  );
}

function Projects({ onOpen }: { onOpen: (image: ProjectImage) => void }) {
  const intro = useReveal();
  return (
    <section id="projects">
      <div className="mx-auto max-w-[1360px] px-5 pb-20 pt-28 sm:px-8 sm:pb-28 sm:pt-36 lg:px-16">
        <div ref={intro.ref} className={`${intro.className} grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24`}>
          <div>
            <span className="eyebrow text-[#4b6961]">Projects / 01</span>
            <h1 className="mt-5 max-w-xs text-5xl font-bold leading-[0.92] tracking-[-0.07em] text-[#173c39] sm:text-6xl">Selected<br />Projects.</h1>
            <p className="mt-6 max-w-xs text-base leading-7 text-[#4b6961]">A custom development board designed, assembled, and tested from scratch.</p>
          </div>
          <div>
            <h2 className="max-w-4xl text-5xl font-bold leading-[0.9] tracking-[-0.075em] text-[#173c39] sm:text-7xl">Custom ESP32-S3<br /><span className="text-[#66a48f]">Development Board</span></h2>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[#4b6961]">
              <span className="font-mono uppercase tracking-[0.12em]">Personal project</span>
              <span className="h-1 w-1 rounded-full bg-[#66a48f]" />
              <span className="font-mono uppercase tracking-[0.12em]">Altium Designer</span>
              <span className="h-1 w-1 rounded-full bg-[#66a48f]" />
              <span className="font-mono uppercase tracking-[0.12em]">ESP32-S3-MINI</span>
            </div>
          </div>
        </div>
      </div>
      <ProjectSection number="01" kicker="The idea" image={projectImages.model} onOpen={onOpen} imageSide="left">
        <p>I designed a custom ESP32-S3 development board in Altium Designer to power and communicate with an LCD module while learning the full hardware design process.</p>
        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#cbd7cc] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#668079]"><CircuitBoard size={14} /> Custom ESP32-S3 board</div>
      </ProjectSection>
      <ProjectSection number="02" kicker="Schematic design" image={projectImages.schematic} onOpen={onOpen} dark>
        <p>I designed the USB-C interface, USB-to-UART communication, power regulation, ESP32 connections, LCD interface, buttons, LEDs, and debug header in Altium.</p>
        <div className="mt-8 grid max-w-md grid-cols-2 gap-3">
          {['USB-C input', 'USB to UART', '5V → 3V3', 'LCD header'].map((label) => <span key={label} className="flex items-center gap-2 text-xs text-[#a6c9b2]"><Check size={14} className="text-[#66a48f]" />{label}</span>)}
        </div>
      </ProjectSection>
      <ProjectSection number="03" kicker="PCB layout" image={projectImages.layout} onOpen={onOpen}>
        <p>I converted the schematic into a physical board layout, considering component placement, power delivery, signal routing, grounding, and the ESP32 antenna keep-out.</p>
      </ProjectSection>
      <ProjectSection number="04" kicker="3D design" image={projectImages.model} onOpen={onOpen} imageSide="left" dark>
        <p>The 3D model helped me check connector placement, board clearances, silkscreen labels, and the overall physical design before manufacturing.</p>
      </ProjectSection>
      <ProjectSection number="05" kicker="Hardware bring-up" image={projectImages.hardware} onOpen={onOpen}>
        <p>The board was manufactured, assembled, powered, and connected to a 1.3 inch LCD module for testing.</p>
      </ProjectSection>
    </section>
  );
}

function Contact() {
  const reveal = useReveal();
  return (
    <section id="contact" className="bg-[#e5ece3]">
      <div ref={reveal.ref} className={`${reveal.className} mx-auto max-w-[1360px] px-5 py-28 sm:px-8 sm:py-36 lg:px-16 lg:py-44`}>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:gap-24">
          <div>
            <span className="eyebrow text-[#668079]">Contact</span>
            <p className="mt-5 max-w-xs text-lg leading-8 text-[#4b6961]">I&apos;m open to engineering internship opportunities and conversations.</p>
          </div>
          <div>
             <h2 className="max-w-3xl text-5xl font-bold leading-[0.9] tracking-[-0.075em] text-[#173c39] sm:text-7xl">Let&apos;s build<br /><span className="text-[#66a48f]">something.</span></h2>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a href="mailto:markust0112@gmail.com" className="group inline-flex items-center justify-between gap-8 rounded-full bg-[#20534e] px-5 py-4 text-sm font-semibold text-[#f6f3eb] transition-transform hover:-translate-y-1 sm:justify-start" data-testid="link-contact-email">
                <span className="flex items-center gap-3"><Mail size={16} strokeWidth={1.5} /> markust0112@gmail.com</span>
                <ArrowUpRight size={17} strokeWidth={1.5} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <a href="https://www.linkedin.com/in/markus-tai/" target="_blank" rel="noreferrer" className="group inline-flex items-center justify-between gap-8 rounded-full border border-[#a8bcb0] px-5 py-4 text-sm font-semibold text-[#20534e] transition-colors hover:border-[#20534e] sm:justify-start" data-testid="link-contact-linkedin">
                LinkedIn <ExternalLink size={16} strokeWidth={1.5} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#d4dbd1] bg-[#f6f3eb]">
      <div className="mx-auto flex max-w-[1360px] flex-col gap-4 px-5 py-7 text-sm text-[#4b6961] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-16">
        <span className="font-semibold text-[#20534e]" data-testid="text-footer-name">Markus Tai</span>
        <a href="#top" className="inline-flex items-center gap-2 font-semibold text-[#20534e] hover:text-[#66a48f]" data-testid="link-back-to-top">Back to top <MoveUpRight size={14} strokeWidth={1.5} /></a>
      </div>
    </footer>
  );
}

function Home() {
  return (
    <div className="portfolio-shell min-h-[100dvh] text-[#173c39]">
      <Navbar />
      <main>
        <Hero />
        <HomeProjects />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

function ProjectsPage() {
  const [selectedImage, setSelectedImage] = useState<ProjectImage | null>(null);
  return (
    <div className="portfolio-shell min-h-[100dvh] text-[#173c39]">
      <Navbar />
      <main className="pt-24">
        <Projects onOpen={setSelectedImage} />
      </main>
      <Footer />
      <Lightbox image={selectedImage} onClose={() => setSelectedImage(null)} />
    </div>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/projects" component={ProjectsPage} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
