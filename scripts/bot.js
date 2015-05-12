'use strict';

function bot() {

  var minDelay = 100,
      maxDuration = 300;

  var sel,
      botName = "",
      sidebar,
      messages,
      learninal,
      learninalSel,
      pendingDialogue,
      botCoords,
      oldBotCoords;

  function robot(name) {
    sel = d3.select("body").append("div").classed("bot", true).attr("id", botName);
    sidebar = sel.append("div").classed("sidebar", true);
    messages = sidebar.append("div").classed("messages", true);
    learninalSel = sidebar.append("div").classed("learninal", true);

    learninal = new Sandbox.View({
      el: learninalSel[0],
      model: new Sandbox.Model(),
      placeholder: "Write code, hit 'Enter'"
    });

    // Listen to dispatcher
    learninal.model.dispatcher.on("evaluate", function(item) {
      messages.append("div").classed("message", true).classed("usercode", true).html(learninal.toEscaped(item.command) + "<br/> ⇒ "+learninal.toEscaped(item.result));
      messages.node().scrollTop = messages.node().scrollHeight;
    })

    return robot;

  }

  robot.botName = function(_) {
    if (!arguments.length) return botName;
    botName = _;
    return robot;
  };

  robot.jumpTo = function(coords) {
    oldBotCoords = botCoords;
    coords = d3.functor(coords).call(robot);
    if(coords instanceof d3.selection) {
      coords = coordsFromSel(coords);
    }
    botCoords = coords;

    sel.style("left", coords[0] + "px")
      .style("top", coords[1] + "px");
    return true;
  }

  robot.goTo = function(coords) {
    oldBotCoords = botCoords;
    coords = d3.functor(coords).call(robot);
    if(coords instanceof d3.selection) {
      coords = coordsFromSel(coords);
    }
    botCoords = coords;

    return new Promise(
      function(resolve,reject) {
        sel
          .transition()
          .duration(1000)
          .style("left", coords[0] + "px")
          .style("top", coords[1] + "px")
          .each("end", resolve(true));
      }
    );
  }

  robot.show = function(bool) {
    bool = d3.functor(bool).call(robot);
    sel.style("opacity", bool ? 1 : 0);
    return true;
  }

  robot.dock = function(bool) {
    bool = d3.functor(bool).call(robot);
    if(bool) {
      this.goTo([0,0]).then(function(value) {
        sel.classed("docked", bool);
      })
    } else {
      sel.classed("docked", bool);
      this.goTo(oldBotCoords);
    }
    return true;
  }

  robot.emote = function(emotion) {
    emotion = d3.functor(emotion).call(robot);
    sel.style('background-image', "url('images/emotes/" + emotion + ".gif')");
    return true;
  }

  robot.speak = function(text) {

    if(!text) text="";
    text = d3.functor(text).call(robot);

    return new Promise(
      function(resolve,reject) {

        var speech = messages.append("div").classed("message", true).classed("speech", true);
        var delay = Math.min(minDelay, maxDuration / text.length);
        var speechTimer = setInterval(function() {
          if(speech.text().length == text.length) {
            clearInterval(speechTimer);
            resolve(speech);
          }
          speech.text(text.substr(0,speech.text().length+1));
          messages.node().scrollTop = messages.node().scrollHeight;
        },delay);

      }
    )
  }

  robot.eval = function(text) {

    if(!text) text="";
    text = d3.functor(text).call(robot);

    return new Promise(
      function(resolve,reject) {

        learninal.model.evaluate(text);
        resolve(true);

        // var code = messages.append("div").classed("message", true).classed("code", true);
        // var delay = Math.min(minDelay, maxDuration / text.length);
        // var codeTimer = setInterval(function() {
        //   if(code.text().length == text.length) {
        //     clearInterval(codeTimer);
        //     eval(text);
        //     resolve(code);
        //   }
        //   code.text(text.substr(0,code.text().length+1));
        //   messages.node().scrollTop = messages.node().scrollHeight;
        // },delay);

      }
    );
  }

  robot.prompts = function(newPrompts) {

    if(!newPrompts) newPrompts = [];
    newPrompts = d3.functor(newPrompts).call(robot);

    return new Promise(
      function(resolve,reject) {

        var responses = messages.append("div").classed("message", true).classed("responses", true);

        var rSel = responses.selectAll(".response")
          .data(newPrompts, function(d) { return d.prompt; });

        rSel.enter()
          .append("div")
          .classed("response", true)
          .text(function(d) { return (d.link ? "☛ " : "» ") + d.prompt; })
          .on("click", function(d) {

            d3.select(this).classed("clicked", true);

            if(d.dialogue) {
              robot.dialogue(d.dialogue).then(function(value) {
                resolve(value);
              });
            } else if(d.link) {
              window.open(d.link, '_blank');
              resolve(true);
            } else {
              resolve(true);
            }

          });

        rSel.exit()
          .remove();

        messages.node().scrollTop = messages.node().scrollHeight;

        return true;

      }
    );
  }

  robot.test = function(testArg) {
    return new Promise(
      function(resolve,reject) {
        var onEvaluate = function(item) {
          if(testArg.call(robot, item)) {
            // if test passes
            learninal.model.dispatcher.off("evaluate", onEvaluate);
            resolve();
          } else {
            // if test fails
          }
        }
        learninal.model.dispatcher.on("evaluate", onEvaluate);
      }
    );
  }

  robot.dialogue = function(pending) {

    pending = d3.functor(pending).call(robot).slice(0);
    pendingDialogue = pending;

    return new Promise(
      function(resolve,reject) {

        if(!pending || pending.length == 0) resolve(true);

        var current = pending.shift();
        var promises = [];

        for (var key in current) {
          if (current.hasOwnProperty(key)) {
            promises.push(robot[key].call(robot, current[key]));
          }
        }

        Promise.all(promises).then(function(value) {

          if(pending.length > 0) {
            robot.dialogue(pending).then(function(value) { resolve(value); });
          } else {
            resolve(true);
          }

        }, function(reason) {

          reject(reason);

        });

      }
    );

  }

  function coordsFromSel(sel) {
    var bounds = sel.node().getBoundingClientRect();
    return [bounds.left + bounds.width/2, bounds.top + bounds.height/2];
  }

  return robot;
}