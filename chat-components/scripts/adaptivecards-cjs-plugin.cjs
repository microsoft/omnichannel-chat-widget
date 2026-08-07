module.exports = () => ({
    visitor: {
        ImportDeclaration(path) {
            if (path.node.source.value === "adaptivecards") {
                path.node.source.value = "adaptivecards/dist/adaptivecards.js";
            }
        }
    }
});
