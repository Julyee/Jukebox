import m from 'mithril';

export const makeSVG = (iconDesc, width, height) =>
    m.trust(`<svg width="${width}" height="${height}" viewBox="0 0 ${iconDesc.width} ${iconDesc.height}"><path d="${iconDesc.svgPathData}"/></svg>`);
