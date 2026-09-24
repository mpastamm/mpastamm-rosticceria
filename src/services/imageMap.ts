import heroVenueImg from '@/src/assets/images/hero_mpastamm_garden.png';
import saltimboccaPanuozzoImg from '@/src/assets/images/card_saltimbocca_mpastamm.png';
import bunGourmetChickenImg from '@/src/assets/images/card_bun_mpastamm.png';
import rutielloRolledSwirlImg from '@/src/assets/images/card_rutiello_mpastamm.png';
import padellinoFocacciaImg from '@/src/assets/images/card_padellino_mpastamm.png';
import friggitoriaPlatterImg from '@/src/assets/images/card_friggitoria_mpastamm.png';
import tecaCountertopImg from '@/src/assets/images/mpastamm_teca_countertop_1790236473318.jpg';

export const ASSET_IMAGES = {
  hero: heroVenueImg,
  saltimbocca: saltimboccaPanuozzoImg,
  bun: bunGourmetChickenImg,
  rutiello: rutielloRolledSwirlImg,
  padellino: padellinoFocacciaImg,
  friggitoria: friggitoriaPlatterImg,
  glassDisplayCase: tecaCountertopImg,
};

export function getProductFallbackImage(categorySlug: string): string {
  switch (categorySlug) {
    case 'saltimbocca':
      return saltimboccaPanuozzoImg;
    case 'bun':
      return bunGourmetChickenImg;
    case 'rutiello-2-0':
    case 'rutiello':
      return rutielloRolledSwirlImg;
    case 'padellino':
      return padellinoFocacciaImg;
    case 'friggitoria':
      return friggitoriaPlatterImg;
    default:
      return heroVenueImg;
  }
}
