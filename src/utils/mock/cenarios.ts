import { definirHoje, hojeReal, resetarRelogio } from "@/lib/clock";
import { addDays, inicioDaSemana } from "@/lib/pulse/datas";
import type { CheckIn, EstadoEmocional, IsoDate } from "@/lib/pulse/types";
import { gravarCheckIns } from "@/utils/mock/store";

/**
 * Ready-made histories for the Modo demonstração, so each rule can be shown
 * without waiting real days. Each scenario may also move "today".
 */
const BOM: EstadoEmocional = { humor: 4, energia: 4, motivacao: 4, pressao: 2, clareza: 4 };
const VARIADO: EstadoEmocional[] = [
  BOM,
  { humor: 5, energia: 4, motivacao: 5, pressao: 2, clareza: 4 },
  { humor: 3, energia: 3, motivacao: 4, pressao: 3, clareza: 3 },
  { humor: 4, energia: 3, motivacao: 4, pressao: 3, clareza: 4 },
  { humor: 5, energia: 5, motivacao: 4, pressao: 1, clareza: 5 },
];
const TENSO: EstadoEmocional = { humor: 2, energia: 2, motivacao: 3, pressao: 5, clareza: 2 };

function regular(date: IsoDate, emocional = VARIADO[Number(date.slice(-2)) % VARIADO.length]): CheckIn {
  const minutos = 240 + (Number(date.slice(-2)) % 4) * 60;
  return {
    date,
    tipo: "regular",
    emocional,
    operacional: { conteudos: Number(date.slice(-1)) % 3, reunioes: Number(date.slice(-1)) % 2, minutosTrabalhados: minutos },
  };
}

function descanso(date: IsoDate): CheckIn {
  return { date, tipo: "descanso", emocional: null, operacional: null };
}

/** Days `from`…`from + count - 1`. */
function dias(from: IsoDate, count: number): IsoDate[] {
  return Array.from({ length: count }, (_, i) => addDays(from, i));
}

/** Friday of the current real week: four days already behind it in the week. */
function sextaDestaSemana(): IsoDate {
  return addDays(inicioDaSemana(hojeReal()), 4);
}

export type Cenario = {
  id: string;
  titulo: string;
  descricao: string;
  montar: () => { hoje: IsoDate | null; checkIns: CheckIn[] };
};

export const CENARIOS: Cenario[] = [
  {
    id: "primeiro-acesso",
    titulo: "Primeiro acesso",
    descricao: "Sem histórico. O primeiro check-in desbloqueia Primeiro pulso.",
    montar: () => ({ hoje: null, checkIns: [] }),
  },
  {
    id: "esqueceu-ontem",
    titulo: "Esqueceu ontem",
    descricao: "Ontem ficou sem registro: o check-in pergunta se é de hoje ou de ontem.",
    montar: () => {
      const hoje = hojeReal();
      return { hoje: null, checkIns: dias(addDays(hoje, -5), 4).map((d) => regular(d)) };
    },
  },
  {
    id: "semana-no-ritmo",
    titulo: "Semana no ritmo",
    descricao: "Sexta-feira, 4 de 5 dias registrados. O check-in de hoje fecha a meta.",
    montar: () => {
      const hoje = sextaDestaSemana();
      const [seg, ter, qua, qui] = dias(inicioDaSemana(hoje), 4);
      return { hoje, checkIns: [regular(seg), regular(ter), descanso(qua), regular(qui)] };
    },
  },
  {
    id: "pressao-alta",
    titulo: "Pressão alta 3 dias",
    descricao: "Os 3 últimos check-ins com Pressão alta ligam o Modo acolhimento.",
    montar: () => {
      const hoje = hojeReal();
      return {
        hoje: null,
        checkIns: [
          ...dias(addDays(hoje, -7), 3).map((d) => regular(d, BOM)),
          ...dias(addDays(hoje, -3), 3).map((d) => regular(d, TENSO)),
        ],
      };
    },
  },
  {
    id: "volta",
    titulo: "Volta depois de sumir",
    descricao: "10 dias sem registro. O próximo check-in desbloqueia De volta.",
    montar: () => {
      const hoje = hojeReal();
      return { hoje: null, checkIns: dias(addDays(hoje, -16), 5).map((d) => regular(d)) };
    },
  },
  {
    id: "quatro-semanas",
    titulo: "4 semanas no ritmo",
    descricao: "Três semanas no ritmo e 4 de 5 nesta. O check-in de hoje completa as 4.",
    montar: () => {
      const hoje = sextaDestaSemana();
      const semana = inicioDaSemana(hoje);
      const anteriores = [-21, -14, -7].flatMap((offset) => {
        const [seg, ter, qua, qui, sex, sab] = dias(addDays(semana, offset), 6);
        return [regular(seg), regular(ter), regular(qua), regular(qui), descanso(sex), regular(sab)];
      });
      const [seg, ter, qua, qui] = dias(semana, 4);
      return { hoje, checkIns: [...anteriores, regular(seg), regular(ter), regular(qua), descanso(qui)] };
    },
  },
];

export function aplicarCenario(cenario: Cenario) {
  const { hoje, checkIns } = cenario.montar();
  gravarCheckIns(checkIns);
  if (hoje) definirHoje(hoje);
  else resetarRelogio();
}

export function resetarDemonstracao() {
  gravarCheckIns([]);
  resetarRelogio();
}
