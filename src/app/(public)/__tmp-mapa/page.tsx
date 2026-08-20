import { ContactMap } from "@/components/public/ContactMap";

export default function TmpMapaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <ContactMap
        address="Av. Carrera 68 # 75A-50, C.C. Metrópolis, Torre Ofiespacios, Of. 325-326"
        city="Bogotá D.C."
        companyName="Compañía Mundial de Comercio S.A.S."
      />
    </div>
  );
}
