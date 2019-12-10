`Documentation and backup code in CouchDb design doc
Views:
=========================================
//byIdReturnsMeta
function (meta) {
  emit(meta._id, meta);
}
=========================================
//byTagsReduced
function (meta) {
 meta.tags.forEach(function (tag) {
      emit(tag.value, null);
    });
}
//Custom Reduce function
function(keys, values) {
  return true
}
=========================================
//byTagsReturnsMetas
function (meta) {
 meta.tags.forEach(function (tag) {
      emit(tag.value, meta);
    });
}