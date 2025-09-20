import Header from '@/components/layout/header';
import HeroSection from '@/components/landing/hero-section';
import DisasterSection from '@/components/landing/disaster-section';
import Footer from '@/components/layout/footer';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const disasterSections = [
  {
    title: { line1: 'Understanding', line2: 'Earthquakes' },
    description:
      "Earthquakes are sudden, violent shaking caused by movements within the Earth's crust. These natural phenomena can cause significant damage to buildings and infrastructure. Understanding safety procedures and preparedness planning is crucial for minimizing risks and ensuring community safety.",
    image: PlaceHolderImages.find((img) => img.id === 'earthquake-video-bg'),
    theme: 'earthquake',
  },
  {
    title: { line1: 'Understanding', line2: 'Floods' },
    description:
      'Floods occur when water overflows onto normally dry land, often caused by heavy rainfall or dam failures. These events can cause extensive property damage and disrupt communities. Understanding early warning systems and evacuation procedures is essential for protecting lives and property.',
    image: PlaceHolderImages.find((img) => img.id === 'flood-video-bg'),
    theme: 'flood',
  },
  {
    title: { line1: 'Understanding', line2: 'Volcanic Eruptions' },
    description:
      'Volcanic eruptions are powerful natural events where molten rock, ash, and gases are expelled from a volcano. These eruptions can cause widespread destruction through lava flows and ash clouds. Understanding monitoring systems and safety protocols is crucial for communities near active volcanoes.',
    image: PlaceHolderImages.find((img) => img.id === 'volcano-video-bg'),
    theme: 'volcano',
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Header />
      <main>
        <HeroSection />
        <div className="bg-card">
          {disasterSections.map((section, index) => (
            <DisasterSection
              key={index}
              title={section.title}
              description={section.description}
              image={section.image}
              theme={section.theme}
            />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
