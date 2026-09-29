import React from 'react';
import { Sparkles, Heart, Award, ArrowRight } from 'lucide-react';
import { BusinessSettings } from '../types';
import { ASSET_IMAGES } from '../services/imageMap';
import { INITIAL_SITE_CONTENT } from '../services/storage';

interface AboutPageProps {
  settings: BusinessSettings;
  onNavigate: (path: string) => void;
}

const featureIcons = [Sparkles, Award, Heart];

export const AboutPage: React.FC<AboutPageProps> = ({ settings, onNavigate }) => {
  const content = { ...INITIAL_SITE_CONTENT, ...(settings.site_content || {}) };
  const features = [
    {
      title: content.about_feature_1_title,
      description: content.about_feature_1_description,
    },
    {
      title: content.about_feature_2_title,
      description: content.about_feature_2_description,
    },
    {
      title: content.about_feature_3_title,
      description: content.about_feature_3_description,
    },
  ];

  return (
    <div className="min-h-screen bg-[#E5DFD4] py-10 text-[#1C211E] sm:py-16">
      <div className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6 lg:space-y-14">
        <section className="overflow-hidden rounded-[2rem] border border-[#D5CABB] bg-[#FAF7F2] shadow-[0_24px_70px_rgba(64,48,28,0.14)]">
          <div className="grid md:grid-cols-[0.88fr_1.12fr]">
            <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
              <span className="mb-3 font-script text-3xl text-[#9A6A32] sm:text-4xl">
                {content.about_eyebrow}
              </span>
              <h1 className="font-serif text-4xl font-bold leading-[0.98] tracking-tight text-[#16251A] sm:text-5xl lg:text-6xl">
                {content.about_title}
              </h1>
              <div className="my-6 h-px w-16 bg-[#B88442]" aria-hidden="true" />
              <p className="max-w-prose whitespace-pre-line text-left text-[15px] leading-8 text-[#5B5044] sm:text-base sm:leading-8">
                {content.about_description}
              </p>
              <div className="mt-8 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#9A6A32]">
                <span className="h-px w-8 bg-[#B88442]" aria-hidden="true" />
                <span>Tradizione, cura e sfizio</span>
              </div>
            </div>

            <div className="relative min-h-[22rem] overflow-hidden md:min-h-[34rem]">
              <img
                src={content.about_image_url || ASSET_IMAGES.hero}
                alt={content.about_image_alt}
                className="absolute inset-0 h-full w-full object-cover object-[68%_center]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#16251A]/25 via-transparent to-transparent" aria-hidden="true" />
              <div className="absolute bottom-5 left-5 rounded-full border border-white/40 bg-[#16251A]/75 px-4 py-2 text-xs font-medium tracking-wide text-white backdrop-blur-sm sm:bottom-7 sm:left-7">
                Il nostro laboratorio
              </div>
            </div>
          </div>
        </section>

        <section aria-label="I valori di Mpastamm">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <span className="font-script text-2xl text-[#9A6A32]">Quello che ci guida</span>
              <h2 className="mt-1 font-serif text-3xl font-bold text-[#16251A] sm:text-4xl">
                Fatto con intenzione
              </h2>
            </div>
            <span className="hidden max-w-xs text-right text-sm leading-6 text-[#6A5B4A] sm:block">
              Ogni ricetta nasce dall&apos;incontro tra tecnica, territorio e passione.
            </span>
          </div>

          <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = featureIcons[index];
              return (
                <article
                  key={feature.title}
                  className="flex min-h-[218px] flex-col rounded-2xl border border-[#D5CABB] bg-[#FAF7F2] p-6 shadow-[0_10px_30px_rgba(64,48,28,0.08)] transition-transform duration-200 hover:-translate-y-1 sm:p-7"
                >
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-[#E1EAD8] text-[#16251A]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#16251A]">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#5B5044]">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <div className="flex justify-center pt-1">
          <button
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-2 rounded-full bg-[#16251A] px-6 py-3 text-sm font-medium text-white shadow-md transition-all hover:bg-[#203626] active:scale-95"
          >
            <span>{content.about_cta_label}</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};
