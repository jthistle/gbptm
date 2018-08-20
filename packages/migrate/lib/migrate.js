const { Report } = require('./models');

/**
 * Gets any useful textual information from a string or undefined if there is
 * none.
 */
function ignoreEmpty(string) {
  if (string === undefined) {
    return undefined;
  }

  if (string.trim().length === 0) {
    // only whitespace, we shouldn't populate the field
    return undefined;
  }

  return string.trim();
}

/**
 * Convert a legacy report to the new report schema.
 */
exports.toNewReport = function toNewReport(legacy) {
  return new Report({
    diff: {
      geometry: legacy.geometry,
      name: ignoreEmpty(legacy.properties.name),
      active: legacy.properties.active,
      access: ignoreEmpty(legacy.properties.access),
      opening: ignoreEmpty(legacy.properties.opening),
      type: ignoreEmpty(legacy.properties.type),
      accessibleType: ignoreEmpty(legacy.properties.accessibleType),
      babyChange: legacy.properties.babyChange,
      radar: legacy.properties.radar,
      attended: legacy.properties.attended,
      automatic: legacy.properties.automatic,
      fee: ignoreEmpty(legacy.properties.fee),
      notes: ignoreEmpty(legacy.properties.notes),
      removal_reason: ignoreEmpty(legacy.properties.removal_reason),
      area: legacy.properties.area,
    },
  });
};

/**
 * Convert a list of legacy reports to a list of new reports, chaining them
 * together into a linked list in the process.
 */
exports.toNewReports = function toNewReports(legacies) {
  let newReps = legacies.map(exports.toNewReport);

  for (let i = 0; i < newReps.length; i++) {
    if (i - 1 >= 0) {
      newReps[i].previous = newReps[i - 1]._id;
    }

    if (i + 1 < newReps.length) {
      newReps[i].next = newReps[i + 1]._id;
    }
  }

  return newReps;
};
