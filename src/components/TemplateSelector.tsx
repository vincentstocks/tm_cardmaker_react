import { useCardStore } from '../store/cardStore';
import { cardTemplates } from '../data/templates';

// Map template IDs to their preview image (we use the main template background image)
const templatePreviews: Record<string, { path: string; orientation: 'portrait' | 'landscape' }> = {
  'green-normal': { path: '/assets/templates/green_normal.png', orientation: 'portrait' },
  'green-big-bottom': { path: '/assets/templates/green_big_bottom.png', orientation: 'portrait' },
  'green-small-bottom': { path: '/assets/templates/green_small_bottom.png', orientation: 'portrait' },
  'blue-normal': { path: '/assets/templates/blue_normal.png', orientation: 'portrait' },
  'blue-big-bottom': { path: '/assets/templates/blue_big_bottom.png', orientation: 'portrait' },
  'blue-big-top': { path: '/assets/templates/blue_big_top.png', orientation: 'portrait' },
  'red-normal': { path: '/assets/templates/red_normal.png', orientation: 'portrait' },
  'red-small-bottom': { path: '/assets/templates/red_small_bottom.png', orientation: 'portrait' },
  'prelude': { path: '/assets/templates/prelude.png', orientation: 'landscape' },
  'corporation': { path: '/assets/templates/corporation.png', orientation: 'landscape' },
};

export function TemplateSelector() {
  const { loadTemplate } = useCardStore();

  return (
    <div className="template-selector">
      <div className="template-selector-content">
        <h1 className="template-selector-title">Create your own Terraforming Mars cards!</h1>
        <p className="template-selector-subtitle">
          Choose a card template to get started
        </p>

        <div className="template-grid">
          {cardTemplates.map((template) => {
            const preview = templatePreviews[template.id];
            return (
              <button
                key={template.id}
                className={`template-card ${preview?.orientation === 'landscape' ? 'template-card--landscape' : ''}`}
                onClick={() => loadTemplate(template.id)}
              >
                <div className="template-card-preview">
                  {preview && (
                    <img
                      src={preview.path}
                      alt={template.label}
                      className="template-card-image"
                    />
                  )}
                </div>
                <span className="template-card-label">{template.label}</span>
              </button>
            );
          })}
        </div>

        <p className="template-selector-credits">
          Inspired by the original website <a href="https://github.com/SliceOfBread/tm_cardmaker" target="_blank" rel="noopener noreferrer">TM Card Maker</a> by SliceOfBread, rebuilt with a focus on usability.<br/>
          This website is not affiliated with Terraforming Mars or Fryxgames in any way.
        </p>
      </div>
    </div>
  );
}
