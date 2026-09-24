import heroVenueImg from '@/src/assets/images/hero_mpastamm_garden.png';
import saltimboccaPanuozzoImg from '@/src/assets/images/saltimbocca_panuozzo_1790236249425.jpg';
import bunGourmetChickenImg from '@/src/assets/images/bun_gourmet_chicken_1790236267095.jpg';
import rutielloRolledSwirlImg from '@/src/assets/images/rutiello_rolled_swirl_1790236285719.jpg';
import padellinoFocacciaImg from '@/src/assets/images/padellino_focaccia_square_1790236300790.jpg';
import friggitoriaPlatterImg from '@/src/assets/images/friggitoria_crocche_arancini_1790236315521.jpg';
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
