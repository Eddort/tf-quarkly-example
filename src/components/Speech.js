import React, { useState, useEffect, useRef } from "react";
import { useOverrides, Override } from "@quarkly/components";
import { Text, Button, Section } from "@quarkly/widgets";

require("@tensorflow/tfjs");

const speechCommands = require("@tensorflow-models/speech-commands");

const createListener = (recognizer, words) => {
	return cb => {
		let command;
		recognizer.listen(result => {
			command = words[result.scores.indexOf(Math.max(...result.scores))];
			recognizer.stopListening();
			cb(command);
		}, {
			includeSpectrogram: true,
			probabilityThreshold: 0.75
		});
	};
};

const init = async () => {
	const recognizer = speechCommands.create("BROWSER_FFT");
	await recognizer.ensureModelLoaded();
	const words = recognizer.wordLabels();
	return {
		recognizer,
		words,
		listen: createListener(recognizer, words)
	};
};

const useSpeech = () => {
	const [command, setCommand] = useState("type button");
	const [listen, setListen] = useState(false);
	const speechUtil = useRef(null);
	useEffect(() => {
		if (!speechUtil?.current?.listen) return;
		if (!listen) return;
		speechUtil?.current?.listen(command => {
			setCommand(command);
			console.log(command);
			setListen(false);
		});
	}, [speechUtil?.current?.listen, listen]);
	useEffect(() => {
		init().then(util => {
			console.log(util);
			speechUtil.current = util;
			setCommand("ready to go");
		});
	}, []);
	return {
		ready: !!speechUtil.current,
		command,
		setListen
	};
};

const defaultProps = {
	padding: "100px 0",
	"sm-padding": "40px 0"
};
const overrides = {
	text: {
		kind: "Text",
		props: {
			as: "h2",
			font: "--headline1",
			"md-font": "--headline2",
			margin: "20px 0 0 0"
		}
	},
	button: {
		kind: "Button",
		props: {
			font: "--lead",
			margin: "20px",
			children: "Нажми на меня и скажи 1..9 или сторону"
		}
	}
};

const Speech = props => {
	const {
		override,
		children,
		rest
	} = useOverrides(props, overrides, defaultProps);
	const {
		ready,
		command,
		setListen
	} = useSpeech();
	return <Section {...rest}>
		      
		{ready && <>
			          
			<Override slot="SectionContent" align-items="center" />
			          
			<Text {...override("text")}>
				{command}
			</Text>
			          
			<Button {...override("button")} onClick={() => setListen(true)} />
			          
			{children}
			        
		</>}
		    
	</Section>;
};

Object.assign(Speech, { ...Section,
	defaultProps,
	overrides
});
export default Speech;