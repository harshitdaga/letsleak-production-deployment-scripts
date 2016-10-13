function initFilterCollections() {
	var filterArray = ["sex","rape","bomb","modi","bjp","congress"];

	var doc = {
		_id : "WORDS",
		f_list : filterArray
	};
	db.c_filter_meta.insert(doc);
};
initFilterCollections();
