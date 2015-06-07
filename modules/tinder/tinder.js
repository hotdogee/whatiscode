!(function(){

  var module = { sel: d3.select('[data-module="tinder"]') }
  addModule(module)

	module.bot = bot();

  module.sel.append("div.bot").call(module.bot);

  var logoHolder = module.sel.append("div.coder-logo");
	var logo = logoHolder.append("img").attr("src","images/coder_logo.jpg");
	var screen = module.sel.append("div.screen");

	var code = screen.append("pre").append("code");

	var footer = screen.append("div.footer");
	var name = footer.append("h3");
	var bio = footer.append("p");

	var dislike = module.sel.append("div.dislike-holder");
	var like = module.sel.append("div.like-holder");
	var buttonDislike = dislike.append("div.button.dislike");
	var buttonLike = like.append("div.button.like");
	


	var codeSamples = [
		{
			"code": "remotedb.allDocs({\n\tinclude_docs: true,\n\tattachments: true\n}).then(function (result) {\n\tvar docs = result.rows;\n\tdocs.forEach(function(element) {\n\t\tlocaldb.put(element.doc).then(function(response) {\n\t\t\talert(\"Pulled doc with id \" + element.doc._id + \" and added to local db.\");\n\t\t}).catch(function (err) {\n\t\t\tif (err.status == 409) {\n\t\t\t\tlocaldb.get(element.doc._id).then(function (resp) {\n\t\t\t\t\tlocaldb.remove(resp._id, resp._rev).then(function (resp) {",
			"bio": "Hey girl, I asynchronously fetch records from a remote database and store them locally, while handling errors with aplomb.",
			"name": "fetchFromServer",
			"paulbot": "This function manages to keep a lot of promises that ultimately aren't worth much; at that right, he could've just called me back."
		},
		{
			"code": "remotedb.allDocs(...).then(function (resultOfAllDocs) {\n\treturn localdb.put(...);\n}).then(function (resultOfPut) {\n\treturn localdb.get(...);\n}).then(function (resultOfGet) {\n\treturn localdb.put(...);\n}).catch(function (err) {\n\tconsole.log(err);\n});",
			"bio": "My tidily-composed promises are entirely without side effects, and I'll be honest about any errors.",
			"name": "?",
			"paulbot": "This is so much better-proportioned than the above."
		},
		{
			"code": "function d3_formatPrefix(d, i) {\n\tvar k = Math.pow(10, abs(8 - i) * 3);\n\treturn {\n\t\tscale: i > 8 ? function(d) {\n\t\t\treturn d / k;\n\t\t} : function(d) {\n\t\t\treturn d * k;\n\t\t},\n\t\tsymbol: d\n\t};\n}",
			"bio": "Worlds collide! I take primitive numbers the way I understand them and help adapt them to your historical conventions of thousands-grouping and Greek prefixes.",
			"name": "d3_formatPrefix",
			"paulbot": "Not that broadly useful and a little enigmatic, but damn pretty compact li’l function."
		},
	];

  var dialogue = [
    {
      "emote": "explaining",
      "speak": "What, you don't think 'pretty' and 'ugly' can apply to code? Take a look at these specimens! They run the gamut. Go on, judge it."
    },
    { "emote": "chill" }
  ];

	module.oninit = function() {
		// module.bot.dialogue(dialogue);
		codeSamples.length ? renderProfile(codeSamples.shift()) : null;
	}

	function renderProfile(profile) {
		name.text(profile.name);
		bio.text(profile.bio);
		code.text(profile.code);

    hljs.highlightBlock(code.node());

		buttonLike.classed("selected", false).on("click", like);
		buttonDislike.classed("selected", false).on("click", like);

		function like(d,i) {
			d3.select(this).classed("selected", true);
			
			codeSamples.length ? renderProfile(codeSamples.shift()) : null


			// module.bot.dialogue([{
			// 	"speak": profile.paulbot,
			// 	"prompts": [{
			// 		"prompt": "Next",
			// 		"do": function() { codeSamples.length ? renderProfile(codeSamples.shift()) : null; }
			// 		}]
			// 	}]);
		}
	}

})();