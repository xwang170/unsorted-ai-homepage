import Image from "next/image";
import { asset } from "./basePath";
import FleetCanvas from "./components/FleetCanvas";
import Reticle from "./components/Reticle";
import Reveal from "./components/Reveal";

const capabilities = [
  {
    number: "01",
    title: "Bipedal mobility",
    copy: "Climbs curbs and stairs, crosses thresholds, and moves through the infrastructure people already use.",
  },
  {
    number: "02",
    title: "Real-time adaptation",
    copy: "Navigates without brittle HD maps and responds to glass, parked bikes, crowds, and a world that keeps changing.",
  },
  {
    number: "03",
    title: "Social compliance",
    copy: "Defers, signals, and yields so the robot can share sidewalks, lobbies, and doorways with people.",
  },
];

const routeSteps = [
  {
    label: "Middle mile",
    title: "Drone or vehicle",
    copy: "Fast, efficient movement across distance.",
  },
  {
    label: "The constant",
    title: "Unsorted",
    copy: "Curbs, stairs, doors, elevators, and handoff.",
    featured: true,
  },
  {
    label: "Final leg",
    title: "Shelf, pad, or door",
    copy: "The last hundred yards, completed end to end.",
  },
];

export default function Home() {
  return (
    <main>
      <Reticle />
      <Reveal />
      <div className="grain" aria-hidden="true" />
      <nav className="siteNav" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="Unsorted AI home">
          <Image
            src={asset("/logo/unsorted-logo-black.png")}
            alt="Unsorted"
            width={520}
            height={72}
            priority
          />
        </a>
        <div className="navLinks">
          <a href="#platform">Platform</a>
          <a href="#proof">Proof</a>
          <a href="#mission">Mission</a>
        </div>
        <a className="navCta" href="mailto:hello@unsorted.ai?subject=Unsorted%20partnership">
          Partner with us
        </a>
      </nav>

      <section className="hero" id="top">
        <FleetCanvas />
        <div className="heroCopy">
          <p className="kicker">Physical AI for last-mile logistics</p>
          <h1>
            <span>We own the first and last 100 yards.</span>
          </h1>
          <p className="heroDek">
            Autonomous systems cover the miles. Unsorted closes the doorstep
            with a compact robot built for curbs, stairs, doors, and handoffs.
          </p>
          <a className="pillButton" href="#platform">
            Meet the platform <span aria-hidden="true">↘</span>
          </a>
          <div className="scrollcue">
            <span aria-hidden="true" />
            follow it in
          </div>
        </div>

        <div className="heroRobot">
          <div className="heroRobotFloat">
            <Image
              src={asset("/assets/robot-cutout.webp")}
              alt="Unsorted V2 delivery robot"
              width={831}
              height={785}
              priority
            />
            <span
              className="robotScan"
              aria-hidden="true"
              style={{
                WebkitMaskImage: `url(${asset("/assets/robot-cutout.webp")})`,
                maskImage: `url(${asset("/assets/robot-cutout.webp")})`,
              }}
            />
          </div>
          <span className="heroShadow" aria-hidden="true" />
        </div>
      </section>

      <section className="platform sectionShell" id="platform">
        <div className="sectionHeading centered">
          <p className="kicker" data-reveal>01 — The missing leg</p>
          <h2 data-reveal>The miles are automated. The doorway is not.</h2>
          <p data-reveal>
            The hardest part of delivery is the most ordinary: the short,
            irregular journey from vehicle or drone to shelf, lobby, and front
            door. That is the terrain Unsorted is designed to own.
          </p>
        </div>

        <div className="capabilityList">
          {capabilities.map((item) => (
            <article className="capabilityCard" key={item.number} data-reveal>
              <span className="cardNumber">{item.number}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="routeSection" id="route">
        <div className="sectionHeading centered inverse">
          <p className="kicker" data-reveal>02 — One robot. Every handoff.</p>
          <h2 data-reveal>You cover the miles. We close the doorstep.</h2>
          <p data-reveal>
            The same platform connects drone pads, autonomous vehicles, stores,
            and front doors — the constant first and last leg across delivery
            networks.
          </p>
        </div>

        <div className="routeFlow" aria-label="Unsorted delivery flow">
          {routeSteps.map((step, index) => (
            <div className="routeItem" key={step.title} data-reveal>
              <article className={step.featured ? "routeCard featured" : "routeCard"}>
                <span>{step.label}</span>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </article>
              {index < routeSteps.length - 1 && (
                <span className="routeArrow" aria-hidden="true">→</span>
              )}
            </div>
          ))}
        </div>

        <p className="routeNote" data-reveal>
          From dark store to drone. From pad to doorstep. From car to front
          door.
        </p>
      </section>

      <section className="proofSection sectionShell" id="proof">
        <div className="proofIntro">
          <p className="kicker" data-reveal>03 — Working hardware</p>
          <h2 data-reveal>Built to leave flat pavement.</h2>
          <p data-reveal>
            Sidewalk robots stop where the real world starts. Unsorted is being
            built around universal urban terrain from day one.
          </p>
        </div>

        <div className="comparison" role="group" aria-label="Mobility capability comparison" data-reveal>
          <article className="comparisonCard mutedCard">
            <p className="comparisonLabel">Flat-pavement robots</p>
            <h3>The route ends early.</h3>
            <dl>
              <div><dt>Curbs</dt><dd>Limited</dd></div>
              <div><dt>Stairs</dt><dd>No</dd></div>
              <div><dt>Doors</dt><dd>No</dd></div>
              <div><dt>Handoff</dt><dd>Human needed</dd></div>
            </dl>
          </article>

          <article className="comparisonCard unsortedCard">
            <p className="comparisonLabel">Unsorted</p>
            <h3>The robot completes the leg.</h3>
            <dl>
              <div><dt>Curbs</dt><dd>Designed in</dd></div>
              <div><dt>Stairs</dt><dd>Designed in</dd></div>
              <div><dt>Doors</dt><dd>In development</dd></div>
              <div><dt>Handoff</dt><dd>End to end</dd></div>
            </dl>
          </article>
        </div>

        <div className="proofStatement">
          <p data-reveal>From live hardware to field validation.</p>
          <h2 data-reveal>Not another cooler on wheels.</h2>
          <p data-reveal>
            A compact, deferential robot for the part of logistics that still
            looks exactly like the human world.
          </p>
        </div>
      </section>

      <section className="mission" id="mission">
        <div className="missionTopline">
          <span>Unsorted AI</span>
          <span>Physical intelligence · 2026</span>
        </div>
        <div className="missionCopy">
          <p className="kicker" data-reveal>The end of the 100-yard handoff.</p>
          <h2 data-reveal>Let every delivery make it all the way.</h2>
          <a className="pillButton lightButton" data-reveal href="mailto:hello@unsorted.ai?subject=Let%E2%80%99s%20talk%20about%20the%20last%20100%20yards">
            Talk to Unsorted <span aria-hidden="true">↗</span>
          </a>
          <p className="missionWhisper" data-reveal>
            <a href="https://xwang170.github.io/unsorted-site/">
              or steer it with your eyes →
            </a>
          </p>
        </div>
        <footer>
          <Image
            src={asset("/logo/unsorted-logo-white.png")}
            alt="Unsorted"
            width={520}
            height={72}
          />
          <p>We close the doorstep.</p>
          <a href="mailto:hello@unsorted.ai">hello@unsorted.ai</a>
        </footer>
      </section>
    </main>
  );
}
