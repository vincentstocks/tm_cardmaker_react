import { useState } from 'react';
import { useCardStore } from '../store/cardStore';
import { TagSelector } from './TagSelector';
import { RequirementSelector } from './RequirementSelector';
import { ImageSelector } from './ImageSelector';
import { CARD_WIDTH_PX, CARD_HEIGHT_PX, CARD_LANDSCAPE_WIDTH_PX, CARD_LANDSCAPE_HEIGHT_PX } from '../utils/cardDimensions';
import { TextLayer } from '../types';

const SCALE = 0.65;

// Portrait tag slot positions (in print pixels, from presets - original 826×1126)
const PORTRAIT_TAG_SLOTS = [
  { x: Math.round(639 * CARD_WIDTH_PX / 826), y: Math.round(67 * CARD_HEIGHT_PX / 1126) },
  { x: Math.round(524 * CARD_WIDTH_PX / 826), y: Math.round(67 * CARD_HEIGHT_PX / 1126) },
  { x: Math.round(410 * CARD_WIDTH_PX / 826), y: Math.round(67 * CARD_HEIGHT_PX / 1126) },
];
const PORTRAIT_TAG_SIZE = Math.round(110 * CARD_WIDTH_PX / 826);

// Landscape tag slot positions — original app uses sx/sy (portrait scaling) for ALL tags
const LW = CARD_LANDSCAPE_WIDTH_PX;  // 1039
const LH = CARD_LANDSCAPE_HEIGHT_PX; // 750

// Prelude tags: uses portrait scaling (sx/sy from 826/1126 → 750/1039)
const PRELUDE_TAG_SLOTS = [
  { x: Math.round(950 * CARD_WIDTH_PX / 826), y: Math.round(78 * CARD_HEIGHT_PX / 1126) },
  { x: Math.round(835 * CARD_WIDTH_PX / 826), y: Math.round(78 * CARD_HEIGHT_PX / 1126) },
  { x: Math.round(721 * CARD_WIDTH_PX / 826), y: Math.round(78 * CARD_HEIGHT_PX / 1126) },
];

// Corporation tags: in original 1126×826 landscape coords
const CORP_TAG_SLOTS = [
  { x: Math.round(940 * CARD_WIDTH_PX / 826), y: Math.round(88 * CARD_HEIGHT_PX / 1126) },
  { x: Math.round(828 * CARD_WIDTH_PX / 826), y: Math.round(88 * CARD_HEIGHT_PX / 1126) },
];

// Tag size uses portrait scaling too
const LANDSCAPE_TAG_SIZE = Math.round(110 * CARD_WIDTH_PX / 826);

// Margins for the image area
const IMAGE_MARGIN_X = Math.round(63 * CARD_WIDTH_PX / 826);
const IMAGE_WIDTH = CARD_WIDTH_PX - 2 * IMAGE_MARGIN_X;
const LANDSCAPE_IMAGE_MARGIN_X = Math.round(63 * LW / 1126);
const LANDSCAPE_IMAGE_WIDTH = LW - 2 * LANDSCAPE_IMAGE_MARGIN_X;

interface EditorOverlayProps {
  containerWidth: number;
  containerHeight: number;
  visible?: boolean;
}

export function EditorOverlay({ containerWidth, containerHeight, visible = true }: EditorOverlayProps) {
  const { layers, addBlock, updateLayer, selectLayer, deleteLayer } = useCardStore();
  const [tagSelectorOpen, setTagSelectorOpen] = useState<{ slotIndex: number; x: number; y: number } | null>(null);
  const [reqSelectorOpen, setReqSelectorOpen] = useState<{ x: number; y: number } | null>(null);
  const [imageSelectorOpen, setImageSelectorOpen] = useState<{ x: number; y: number } | null>(null);

  const baseLayer = layers.find(l => l.type === 'base');
  const isLandscape = baseLayer && (baseLayer as any).width > (baseLayer as any).height;

  if (!visible) return null;

  // Get actual positions from the store layers
  const costLayer = layers.find(l => l.name === 'Cost') as TextLayer | undefined;
  const reqLayer = layers.find(l => l.name?.includes('Requirement') || l.name === 'No Requirement');
  const cardNameLayer = layers.find(l => l.name === 'Card Name') as TextLayer | undefined;
  const descriptionLayer = layers.find(l => l.name === 'Description') as TextLayer | undefined;
  const flavorLayer = layers.find(l => l.name === 'Flavor Text') as TextLayer | undefined;
  const fanMadeLayer = layers.find(l => l.name === 'FAN MADE') as TextLayer | undefined;

  // Dynamic image area: between Card Name bottom and FAN MADE top
  // Detect if this is a blue card
  const templateBlock = layers.find(l => l.type === 'block' && (l as any).blockId?.startsWith('tpl-'));
  const isBlueCard = templateBlock && (templateBlock as any).blockId?.includes('blue');

  // Select tag slots and size based on orientation and template type
  const isCorporation = templateBlock && (templateBlock as any).blockId?.includes('corporation');
  const tagSlots = isLandscape
    ? (isCorporation ? CORP_TAG_SLOTS : PRELUDE_TAG_SLOTS)
    : PORTRAIT_TAG_SLOTS;
  const tagSize = isLandscape ? LANDSCAPE_TAG_SIZE : PORTRAIT_TAG_SIZE;
  const imgMarginX = isLandscape ? LANDSCAPE_IMAGE_MARGIN_X : IMAGE_MARGIN_X;
  const imgWidth = isLandscape ? LANDSCAPE_IMAGE_WIDTH : IMAGE_WIDTH;

  const imageArea = (() => {
    if (!cardNameLayer || !fanMadeLayer) return null;

    if (isLandscape) {
      // Landscape cards: image area between Card Name and FAN MADE
      const topY = cardNameLayer.y + cardNameLayer.height * 0.5;
      const bottomY = fanMadeLayer.y - fanMadeLayer.height * 1.5;
      return { x: imgMarginX, y: Math.round(topY), w: imgWidth, h: Math.round(bottomY - topY) };
    }

    if (isBlueCard) {
      const cardH = baseLayer ? (baseLayer as any).height : CARD_HEIGHT_PX;
      const blockId = (templateBlock as any).blockId as string;

      if (blockId.includes('blue-big-top')) {
        // Blue Big Top: 1/4 height, top edge at card center
        const h = Math.round(cardH / 4);
        const y = Math.round(cardH / 2);
        return { x: imgMarginX, y, w: imgWidth, h };
      }

      // Other blue cards: centered around middle, 1/3 of card height
      const h = Math.round(cardH / 3);
      const y = Math.round((cardH - h) / 2);
      return { x: imgMarginX, y, w: imgWidth, h };
    }

    // Green/Red cards: between Card Name and FAN MADE
    const topY = cardNameLayer.y + cardNameLayer.height * 0.5;
    const bottomY = fanMadeLayer.y - fanMadeLayer.height * 1.5;
    return {
      x: imgMarginX,
      y: Math.round(topY),
      w: imgWidth,
      h: Math.round(bottomY - topY),
    };
  })();

  // Helper to compute screen position for a text layer zone
  const textZone = (layer: TextLayer | undefined, heightMultiplier = 1.3) => {
    if (!layer) return null;
    let left: number;
    if (layer.justify === 'center') {
      left = (layer.x - layer.width / 2) * SCALE;
    } else if (layer.justify === 'right') {
      left = (layer.x - layer.width) * SCALE;
    } else {
      left = layer.x * SCALE;
    }
    const top = (layer.y - layer.height * 0.9) * SCALE;
    const height = Math.max(layer.height * SCALE * heightMultiplier, 20);
    // Clamp height so zone doesn't extend past card bottom
    const cardH = containerHeight;
    const clampedHeight = Math.min(height, cardH - top - 4);
    return {
      left,
      top,
      width: layer.width * SCALE,
      height: Math.max(clampedHeight, 16),
    };
  };

  // Cost zone: square centered on cost text position
  const costZone = costLayer ? (() => {
    const displaySize = costLayer.height * SCALE * 1.3;
    const centerX = costLayer.x * SCALE;
    const centerY = (costLayer.y - costLayer.height * 0.9 + costLayer.height * 0.5) * SCALE;
    return {
      left: centerX - displaySize / 2 + 1,
      top: centerY - displaySize / 2 - 1,
      width: displaySize,
      height: displaySize,
    };
  })() : null;

  const cardNameZone = textZone(cardNameLayer);
  // Description: make zone about 4 lines tall but clamp to card
  const descriptionZone = textZone(descriptionLayer, 4);
  const flavorZone = textZone(flavorLayer, 1.5);

  // Requirement zone: derive from actual requirement layer
  const reqZone = reqLayer ? {
    left: (reqLayer as any).x * SCALE,
    top: (reqLayer as any).y * SCALE,
    width: Math.max((reqLayer as any).width * SCALE, 40),
    height: (reqLayer as any).height * SCALE,
  } : null;

  const handleTagClick = (slotIndex: number, e: React.MouseEvent) => {
    setTagSelectorOpen({ slotIndex, x: e.clientX, y: e.clientY });
  };

  const handleTextClick = (layer: TextLayer | undefined) => {
    if (layer) {
      selectLayer(layer.id);
      // Delay to allow React to re-render (selected layer moves to second pass)
      // and the new component instance to mount and register its event listener
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('trigger-inline-edit', { detail: { layerId: layer.id } }));
      }, 200);
    }
  };

  const handleCostClick = () => handleTextClick(costLayer);
  const handleCardNameClick = () => handleTextClick(cardNameLayer);
  const handleDescriptionClick = () => handleTextClick(descriptionLayer);
  const handleFlavorClick = () => handleTextClick(flavorLayer);

  const handleReqClick = (e: React.MouseEvent) => {
    setReqSelectorOpen({ x: e.clientX, y: e.clientY });
  };

  const handleImageClick = (e: React.MouseEvent) => {
    setImageSelectorOpen({ x: e.clientX, y: e.clientY });
  };

  const handleTagSelected = (tagBlockId: string) => {
    if (!tagSelectorOpen) return;

    const { slotIndex } = tagSelectorOpen;
    const pos = tagSlots[slotIndex];
    if (!pos) return;

    // Find existing tag in this slot (by position proximity OR by matching a tag blockId near this slot)
    const currentLayers = useCardStore.getState().layers;
    const existingTag = currentLayers.find(l =>
      l.type === 'block' &&
      (l as any).blockId?.startsWith('tag-') &&
      Math.abs((l as any).x - pos.x) < 30 &&
      Math.abs((l as any).y - pos.y) < 30
    );

    if (existingTag) {
      // Remove old tag and add the new one
      deleteLayer(existingTag.id);
    }

    // Add new tag at the slot position
    addBlock(tagBlockId);
    const allLayers = useCardStore.getState().layers;
    const newLayer = allLayers[allLayers.length - 1];
    if (newLayer) {
      updateLayer(newLayer.id, {
        x: pos.x,
        y: pos.y,
        width: tagSize,
        height: tagSize,
      } as any);
    }

    setTagSelectorOpen(null);

    // Update tag holder position for corporation cards
    if (isCorporation) {
      const currentLayers = useCardStore.getState().layers;
      const tagHolderLayer = currentLayers.find(l => l.name === 'Tag Holder');
      if (tagHolderLayer) {
        // Count how many tags are placed in corp tag slots
        const tagCount = CORP_TAG_SLOTS.filter(slot =>
          currentLayers.some(l =>
            l.type === 'block' &&
            l.name !== 'Tag Holder' &&
            Math.abs((l as any).x - slot.x) < 15 &&
            Math.abs((l as any).y - slot.y) < 15
          )
        ).length;

        // Tag holder presets from original: x shifts left as tags are added
        // Original 1126×826 coords: 0 tags=969, 1 tag=898, 2 tags=794
        const holderXPresets = [969, 898, 794];
        const holderX = holderXPresets[Math.min(tagCount, 2)];
        updateLayer(tagHolderLayer.id, {
          x: Math.round(holderX * LW / 1126),
        } as any);
      }
    }
  };

  const handleReqSelected = (reqBlockId: string) => {
    if (!reqSelectorOpen) return;

    // Find any existing requirement block (by blockId prefix)
    const currentLayers = useCardStore.getState().layers;
    const existingReq = currentLayers.find(l =>
      l.type === 'block' &&
      (l as any).blockId?.startsWith('req-')
    );

    if (existingReq) {
      deleteLayer(existingReq.id);
    }

    // Add new requirement — addBlock applies the correct preset automatically
    addBlock(reqBlockId);

    setReqSelectorOpen(null);
  };

  const handleImageSelected = (imageBlockId: string) => {
    if (!imageSelectorOpen) return;
    if (!imageArea) return;

    const imgPos = {
      x: imageArea.x,
      y: imageArea.y,
      width: imageArea.w,
      height: imageArea.h,
    };

    // Find existing image block in the image area
    const existingImg = layers.find(l =>
      l.type === 'block' &&
      l.name !== 'No Requirement' &&
      !l.name?.includes('Requirement') &&
      !(l as any).blockId?.startsWith('tpl-') &&
      !(l as any).blockId?.startsWith('req-') &&
      !(l as any).blockId?.startsWith('tag-') &&
      Math.abs((l as any).y - imgPos.y) < 60
    );

    if (existingImg) {
      updateLayer(existingImg.id, { blockId: imageBlockId } as any);
    } else {
      addBlock(imageBlockId);
      const allLayers = useCardStore.getState().layers;
      const newLayer = allLayers[allLayers.length - 1];
      if (newLayer) {
        updateLayer(newLayer.id, imgPos as any);
      }
    }

    setImageSelectorOpen(null);
  };

  return (
    <>
      <div className="editor-overlay" style={{ width: containerWidth, height: containerHeight }}>
        {/* Tag slots — circular, positioned exactly where tags render */}
        {tagSlots.map((pos, i) => (
          <button
            key={`tag-${i}`}
            className="editor-zone editor-zone-circle"
            style={{
              left: pos.x * SCALE,
              top: pos.y * SCALE,
              width: tagSize * SCALE,
              height: tagSize * SCALE,
            }}
            onClick={(e) => handleTagClick(i, e)}
            title={`Tag ${i + 1}`}
          >
            <span className="editor-zone-label">+</span>
          </button>
        ))}

        {/* Cost zone — rectangular, aligned to actual cost text */}
        {costZone && (
          <button
            className="editor-zone editor-zone-rect"
            style={{
              left: costZone.left,
              top: costZone.top,
              width: costZone.width,
              height: costZone.height,
            }}
            onClick={handleCostClick}
            title="Edit Cost"
          >
            <span className="editor-zone-label">Cost</span>
          </button>
        )}

        {/* Requirement zone — rectangular, aligned to actual requirement block */}
        {reqZone && (
          <button
            className="editor-zone editor-zone-rect"
            style={{
              left: reqZone.left,
              top: reqZone.top,
              width: reqZone.width,
              height: reqZone.height,
            }}
            onClick={handleReqClick}
            title="Set Requirement"
          >
            <span className="editor-zone-label">Req</span>
          </button>
        )}

        {/* Image zone — rectangular, in the illustration area */}
        {imageArea && (
          <button
            className="editor-zone editor-zone-rect editor-zone-image"
            style={{
              left: imageArea.x * SCALE,
              top: imageArea.y * SCALE,
              width: imageArea.w * SCALE,
              height: imageArea.h * SCALE,
            }}
            onClick={handleImageClick}
            title="Set Card Image"
          >
            <span className="editor-zone-label">Image</span>
          </button>
        )}

        {/* Card Name zone */}
        {cardNameZone && (
          <button
            className="editor-zone editor-zone-rect"
            style={{
              left: cardNameZone.left,
              top: cardNameZone.top,
              width: cardNameZone.width,
              height: cardNameZone.height,
            }}
            onClick={handleCardNameClick}
            title="Edit Card Name"
          >
            <span className="editor-zone-label">Name</span>
          </button>
        )}

        {/* Description zone */}
        {descriptionZone && (
          <button
            className="editor-zone editor-zone-rect"
            style={{
              left: descriptionZone.left,
              top: descriptionZone.top,
              width: descriptionZone.width,
              height: descriptionZone.height,
            }}
            onClick={handleDescriptionClick}
            title="Edit Description"
          >
            <span className="editor-zone-label">Description</span>
          </button>
        )}

        {/* Flavor Text zone */}
        {flavorZone && (
          <button
            className="editor-zone editor-zone-rect"
            style={{
              left: flavorZone.left,
              top: flavorZone.top,
              width: flavorZone.width,
              height: flavorZone.height,
            }}
            onClick={handleFlavorClick}
            title="Edit Flavor Text"
          >
            <span className="editor-zone-label">Flavor</span>
          </button>
        )}
      </div>

      {tagSelectorOpen && (
        <TagSelector
          x={tagSelectorOpen.x}
          y={tagSelectorOpen.y}
          onSelect={handleTagSelected}
          onClose={() => setTagSelectorOpen(null)}
        />
      )}

      {reqSelectorOpen && (
        <RequirementSelector
          x={reqSelectorOpen.x}
          y={reqSelectorOpen.y}
          onSelect={handleReqSelected}
          onClose={() => setReqSelectorOpen(null)}
        />
      )}

      {imageSelectorOpen && (
        <ImageSelector
          x={imageSelectorOpen.x}
          y={imageSelectorOpen.y}
          imageArea={imageArea || undefined}
          onSelect={() => setImageSelectorOpen(null)}
          onClose={() => setImageSelectorOpen(null)}
        />
      )}
    </>
  );
}
