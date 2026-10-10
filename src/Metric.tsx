type MetricProps = { label: string; value: string; detail: string; tone?: string };

export default function Metric({ label, value, detail, tone }: MetricProps) {
  return (
    <article className="metric">
      <span>{label}</span>
      <strong className={tone}>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}
