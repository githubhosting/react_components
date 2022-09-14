import "./PyLink.css";
import "https://cdn.jsdelivr.net/pyodide/v0.21.2/full/pyodide.js";
import {Component} from "react";

export default class PyLink extends Component {
    static defaultProps = {
        pkgs: []
    }

    constructor(props) {
        super(props);
        this.pyLink = window.loadPyodide();
        this.state = {doneSetup: false};
    }

    async componentDidMount() {
        this.pyLink = await this.pyLink;
        await this.loadPkgs(this.props.pkgs);
        await this.loadZip(require("./src.zip"));
        await this.loadPy(require("./py_entry.py"));
        console.log("PyLink Setup Complete");
        this.setState({doneSetup: true});
    }

    runScript(script) {
        this.pyLink.runPython(script);
    }

    getFoo(foo) {
        foo = this.pyLink.runPython(foo);

        function wrap({args, kwargs} = {args: [], kwargs: {}}) {
            foo.callKwargs(...args, kwargs);
        }

        return wrap;
    }

    async loadZip(file, type = 'zip', to = './src') {
        this.pyLink.unpackArchive(await (await fetch(file)).arrayBuffer(), type, {extractDir: to});
    }

    // file -> require(fpath)
    async loadPy(file) {
        let script = await (await fetch(file)).text();
        this.runScript(script);
    }

    async loadPkgs(names) {
        await this.pyLink.loadPackage(names);
    }

    render() {
        return (
            <div className="PyLink">
                {this.state.doneSetup ? "Use the console to see the results" : "PyLink Loading..."}<br/>
                <button onClick={() => this.getFoo("fooPrint")()}>console log from python</button>
                <br/>
                <button onClick={() => this.getFoo("fooArgsNoReturn")({
                        args: [420, 69.69, "Foo wo", true, null, undefined, NaN],
                        kwargs: {
                            list: [1, 1.1, "loo", false],
                            dict: {"m1": 1, "m2": 2.2, "m3": "moo", "m4": null},
                            num: 73,
                        }
                    }
                )}>
                    send args and kwargs (no return) to python
                </button>
            </div>
        );
    }
}