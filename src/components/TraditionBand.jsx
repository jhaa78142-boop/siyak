import Reveal from "./Reveal";
import { companyInfo } from "../data/products";

export default function TraditionBand() {
  return (
    <section className="bg-gray-100 border-y border-gray-200 py-3 sm:py-4">
      <Reveal className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <p className="text-steel-dark text-[14px] sm:text-[16px] md:text-[18px] font-normal leading-snug sm:leading-[1.6]">
          India&rsquo;s trusted stockist & exporter —{" "}
          <span className="font-semibold">{companyInfo.name}</span>{" "}
          ships certified steel & alloys to 40+ countries.
        </p>
        <p className="mt-1 text-deep font-bold uppercase text-[13px] sm:text-[15px] md:text-[18px] leading-tight tracking-wide">
          &ldquo;TRUSTED STOCKS · ON-TIME SHIPMENTS · EVERY TIME&rdquo;
        </p>
      </Reveal>
    </section>
  );
}
