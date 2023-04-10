const fs = require('node:fs');
const path = require('node:path');
const axios = require("axios");
const cheerio = require('cheerio');
const request = require('request');
const mysql = require('mysql2');
const CreateDB = require('./create-db.js');
require('dotenv').config();

const { msgInstruction, msgEmbed4Coin, msgEmbed4Nft} = require('./embed.js');
const { Client, Events, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});
const connection = mysql.createConnection({
	host: '127.0.0.1',
	user: process.env.MYSQL_ID,
	password: process.env.MYSQL_PW,
  });

connection.connect();

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
	CreateDB.create();
});

client.on("messageCreate", async (msg) => {
	if (msg.content.startsWith(".me")) {
    connection.query("USE magiceden", function (error, result, fields) {
      if (error) throw error;
    });
		const args = msg.content.split(" ");
		if(args.length === 1){
			msgInstruction(msg, 'me');
			return;
		}
		if(args[1] !== 'save'){
			if(args.length > 2){
				msgInstruction(msg, 'me');
				return;
			}else{
        const nickname = args[1];
        connection.query(`SELECT * FROM nft WHERE nickname="${nickname}"`, async function(error, result, field) {
          if (error) throw error;
          if(!result.length){
            msgInstruction(msg, 'me');
            return;
          }else{
            const link = result[0].link;
            msgEmbed4Nft(msg, link, nickname);
          }
        });
      }
		}else if(args[1] === 'save'){
      const link = args[3];
      const check = await checkEnableLink(msg, link);
      if(!check){
        msgInstruction(msg, 'me');
        return;
      }       
      connection.query(
        `INSERT INTO nft (nickname, link) VALUES ("${args[2]}", "${args[3]}")`,
        function (error, results, fields) {
          if (error) throw error;
          msg.reply("Saved")
          msgEmbed4Nft(msg, link, args[2]);
        }
      );
    }
    }else if (msg.content.startsWith(".coin")) {
      const args = msg.content.split(" ");
      if(args.length > 2 || args.length === 1){
          msgInstruction(msg, 'coin');
          return;
      }
      const sig = args.pop();
      const upperSig = sig.toUpperCase();
      console.log(upperSig)
      msgEmbed4Coin(msg, upperSig);
    }else if (msg.content.startsWith(".exit")) {
        msg.reply("The server will shut down")
    }
  });

  const checkEnableLink = async (msg, link) => {
    const regex = /^https?:\/\/magiceden\.io\/(?:ko\/)?marketplace\/\w+$/;
    if (!regex.test(link)) {
        return false;
    }
    return true;
  }

client.login(process.env.TOKEN);

