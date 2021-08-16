module.exports = function (component) {
  if (!component) return null;

  return {
    ...component.component_options
  };
};
