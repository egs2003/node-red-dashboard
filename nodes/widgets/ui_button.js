module.exports = function(RED) {
    function ButtonNode(config) {
        var node = this;

        // create node in Node-RED
        RED.nodes.createNode(this, config);

        // which page are we rendering this widget
        var page = RED.nodes.getNode(config.page);

        const evts = {
            onAction: true,
            onInput: function (msg, send) {
                var error = null
                var event = msg.event

                if (event) {
                    console.log('event triggered by UI button click')
                }

                // retrieve the payload we're sending from this button
                var payloadType = config.payloadType;
                var payload = config.payload;

                if (payloadType === 'flow' || payloadType === 'global') {
                    try {
                        var parts = RED.util.normalisePropertyExpression(payload);
                        if (parts.length === 0) {
                            throw new Error();
                        }
                    }
                    catch(err) {
                        node.warn("Invalid payload property expression - defaulting to node id")
                        payload = node.id;
                        payloadType = 'str';
                    }
                } else if (payloadType === "date") {
                    payload = Date.now()
                } else {
                    try {
                        payload = RED.util.evaluateNodeProperty(payload, payloadType, node)
                    } catch(err) {
                        error = err
                        if (payloadType === "bin") {
                            node.error("Badly formatted buffer");
                        }
                        else {
                            node.error(err, payload);
                        }
                    }
                }
                // retrieve the topic we're sending from this button
                if (!error) {
                    const topic = RED.util.evaluateNodeProperty(config.topic, config.topicType || "str", node, msg)
                    console.log(payload, topic)
                    msg.payload = payload
                    msg.topic = topic
                    send(msg)
                }
            }
        }

        // inform the dashboard UI that we are adding this node
        page.register(node, config, evts)
    }

    RED.nodes.registerType("ui-button", ButtonNode);
};