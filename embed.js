const fs = require('node:fs');
const path = require('node:path');
const axios = require("axios");
const cheerio = require('cheerio');
const request = require('request');
const mysql = require('mysql2');
const CreateDB = require('./create-db.js');
require('dotenv').config();

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

connection.query("USE magiceden", function (error, result, fields) {
    if (error) throw error;
  });


const msgInstruction = (msg, type) => {
    if(type === 'me'){
        const embed = new EmbedBuilder()
        .setColor("#F7921E")
        .setTitle("Error\nIncorrect command or was not saved.\n\nHow to use\n .me save 유츠 https://magiceden.io/marketplace/y00ts")
        .setTimestamp()
        .setFooter({ text: 'Powerd By viviviviviid', iconURL: 'https://gateway.pinata.cloud/ipfs/QmUogCrCHfFV2mdPcuDbpw9tEPyY9anXTQQUohpPaQv2tn?_gl=1*1oj093v*_ga*NGQ1ZDcwYjEtYzQyZC00ODM0LWJiOWUtM2QwOGI3NGMxYWI3*_ga_5RMPXG14TE*MTY3OTc0OTQ2MC4xLjEuMTY3OTc0OTU2Ni41OC4wLjA.' });
        msg.channel.send({ embeds: [embed] });
        console.log("Instruction for NFT Collection");
    }else if(type === 'coin'){
        const embed = new EmbedBuilder()
        .setColor("#F7921E")
        .setTitle("Error\nIncorrect Command or incorrect coin signature.\n\nHow to use\n.coin eth\n.coin ETH")
        .setTimestamp()
        .setFooter({ text: 'Powerd By viviviviviid', iconURL: 'https://gateway.pinata.cloud/ipfs/QmUogCrCHfFV2mdPcuDbpw9tEPyY9anXTQQUohpPaQv2tn?_gl=1*1oj093v*_ga*NGQ1ZDcwYjEtYzQyZC00ODM0LWJiOWUtM2QwOGI3NGMxYWI3*_ga_5RMPXG14TE*MTY3OTc0OTQ2MC4xLjEuMTY3OTc0OTU2Ni41OC4wLjA.' });
        msg.channel.send({ embeds: [embed] });
        console.log("Instruction for coin");
    }
}

  const msgEmbed4Coin = async (msg, upperSig) => {
    try {
      const response_usd = await axios.get(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${upperSig}&convert=USD`, { 
          headers: {
              'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_KEY,
          },
      });
      const data_usd = response_usd.data.data[upperSig].quote['USD'];

      const response_krw = await axios.get(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${upperSig}&convert=KRW`, { 
          headers: {
              'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_KEY,
          },
      });
      const data_krw = response_krw.data.data[upperSig].quote['KRW'];

      const embed = new EmbedBuilder()
      .setColor("#00FF80")
      .setTitle(`${upperSig} Price`)
      .addFields(
          { name: 'KRW', value: `${priceToString(data_krw.price.toFixed(0))} ₩`, inline: true },
          { name: 'USD', value: `${priceToString(data_usd.price.toFixed(3))} $`, inline: true },
          { name: '1h', value: `${signChecker(data_usd.percent_change_1h.toFixed(2))}%`, inline: true },
          { name: '24h', value: `${signChecker(data_usd.percent_change_24h.toFixed(2))}%`, inline: true },
          { name: '7d', value: `${signChecker(data_usd.percent_change_7d.toFixed(2))}%`, inline: true },
          { name: '30d', value: `${signChecker(data_usd.percent_change_30d.toFixed(2))}%`, inline: true },
      )
      .setTimestamp()
      .setFooter({ text: 'Powerd By viviviviviid', iconURL: 'https://gateway.pinata.cloud/ipfs/QmUogCrCHfFV2mdPcuDbpw9tEPyY9anXTQQUohpPaQv2tn?_gl=1*1oj093v*_ga*NGQ1ZDcwYjEtYzQyZC00ODM0LWJiOWUtM2QwOGI3NGMxYWI3*_ga_5RMPXG14TE*MTY3OTc0OTQ2MC4xLjEuMTY3OTc0OTU2Ni41OC4wLjA.' });
      msg.channel.send({ embeds: [embed] });
    }catch (error) {
        console.log(error)
        msgInstruction(msg, 'coin')
    }
  }  

  const msgEmbed4Nft = async (msg, link, nickname) => {
    const thumbnailLink = await getCollectionThumbnailLink(link);
    const nftId = link.split("/").pop();
    const apiUrl = `http://api-mainnet.magiceden.dev/v2/collections/${nftId}/stats`;
    try {
        const response = await axios.get(apiUrl)
        
        let lastPrice, variance, gapPrice;
        const nftData = response.data;
        const currentPrice = Math.floor(nftData.floorPrice/1000000000 * 100)/100;
        if(response.status !== 200){
            msgInstruction(msg);
        }

        const gapPricePromise = new Promise((resolve, reject) => {
            connection.query(`SELECT * FROM nft WHERE link="${link}"`, async function(error, result, field) {
                if (error) reject(error);
                console.log(result);
                lastPrice = result[0].lastCallPrice;
                if(lastPrice === null){
                    lastPrice = 0;
                }
                gapPrice = lastPrice - currentPrice;
                resolve(gapPrice);
            });
        });

        gapPrice = Math.floor(await gapPricePromise * 100) / 100;

        if(gapPrice > 0){
            gapPrice = "- " + String(gapPrice);
        }else if(gapPrice < 0){
            gapPrice = "+ " + String((-1) * gapPrice);
        }

        if(!gapPrice)
            variance = false;
        else
            variance = true;

        const embed = new EmbedBuilder()
        .setColor("#F7921E")
        .setTitle(`${nftData.symbol}`)
        .setURL(link)
        .setThumbnail(thumbnailLink)
        .addFields(
            { name: 'Price', value: `${currentPrice} SOL`, inline: true },
            variance ? { name: 'Gap of Price', value: `${gapPrice} SOL`, inline: true } : { name:'Gap of Price', value: `same as before`, inline: true },
            { name: 'Listing', value: `${nftData.listedCount}`, inline: true },
        )
        .setTimestamp()
        .setFooter({ text: 'Powerd By viviviviviid', iconURL: 'https://gateway.pinata.cloud/ipfs/QmUogCrCHfFV2mdPcuDbpw9tEPyY9anXTQQUohpPaQv2tn?_gl=1*1oj093v*_ga*NGQ1ZDcwYjEtYzQyZC00ODM0LWJiOWUtM2QwOGI3NGMxYWI3*_ga_5RMPXG14TE*MTY3OTc0OTQ2MC4xLjEuMTY3OTc0OTU2Ni41OC4wLjA.' });
        msg.channel.send({ embeds: [embed] });

        connection.query(
            `UPDATE nft SET lastCallPrice = ${currentPrice} WHERE nickname = "${nickname}"`,
            function (error, results, fields) {
                if (error) throw error;
            } 
        );
    } catch (error) {
      console.log(error);
      msgInstruction(msg, 'me');
    }
  }

  function priceToString(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
  const signChecker = (str) => {
    if(str[0] !== '-')
        return '+' + str;
    else
        return str;
  }
  
  async function getCollectionThumbnailLink(url) {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const thumbnailLink = $('meta[property="og:image"]').attr('content');
    return thumbnailLink;
  }

module.exports = {
    msgInstruction,
    msgEmbed4Coin,
    msgEmbed4Nft,
}