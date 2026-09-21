const sections = [
  { title: 'Overview', prompt: 'What this is and who it is for.' },
  { title: 'Problem', prompt: 'What needed solving and the constraints.' },
  { title: 'Approach', prompt: 'Key design and engineering decisions.' },
  { title: 'Outcome', prompt: 'What shipped and what was learned.' },
];

export function ProjectCaseStudy() {
  return (
    <div className="max-w-3xl space-y-10">
      <p className="text-muted-foreground text-lg">Coming soon.</p>

      {sections.map((section) => (
        <section key={section.title} className="space-y-2">
          <h2 className="text-xl font-semibold">{section.title}</h2>
          <p className="text-muted-foreground">{section.prompt}</p>
        </section>
      ))}
    </div>
  );
}
