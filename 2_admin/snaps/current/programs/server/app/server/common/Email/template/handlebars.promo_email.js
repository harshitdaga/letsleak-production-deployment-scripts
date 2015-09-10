(function(){Handlebars = Handlebars || {};Handlebars.templates = Handlebars.templates || {} ;var template = OriginalHandlebars.compile("<template name=\"Promo\">\n    <!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">\n    <html xmlns=\"http://www.w3.org/1999/xhtml\">\n    <head>\n        <title>LetsLeak - Naughty nothings, Silly somethings</title>\n        <meta http-equiv=\"Content-Type\" content=\"text/html; charset=iso-8859-1\">\n        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0,maximum-scale=1.0, user-scalable=0\">\n        <link href='http://fonts.googleapis.com/css?family=Lato' rel='stylesheet' type='text/css'>\n        <style type=\"text/css\">\n            @media only screen and (min-device-width: 320px) and (max-device-width: 600px) {\n                h2 {\n                    font-size: 20px;\n                    font-weight: bold;\n                }\n                p {\n                    font-size: .8em;\n                }\n            }\n            @media only screen and (min-device-width: 767px) {\n                h2 {\n                    font-size: 1.2em;\n                }\n            }\n            a{\n                text-decoration: none;\n            }\n        </style>\n    </head>\n    <body>\n    <table width=\"90%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin:20px auto; background-color:#ffffff;max-width: 690px;\">\n        <tr>\n            <td align=\"center\">\n                <table cellspacing=\"0\" cellpadding=\"0\" border=\"0\">\n                    <tr>\n                        <td>\n                            <a href=\"{{this.url}}\" target=\"_blank\">\n                                <div style=\"margin-top:10px;\"><img src=\"{{this.url}}/images/letsleak_logo.png\" width=\"37\" height=\"84\" alt=\"\"></div>\n                            </a>\n                        </td>\n                        <td>\n                            <a href=\"{{this.url}}\" target=\"_blank\">\n                                <div style=\"display:inline-block;font-family: 'Lato', sans-serif; font-weight: 400; font-size:60px; font-weight:bold; color:#3c3c3c;\">LetsLeak<img src=\"{{this.url}}/images/tag-line.jpg\" style=\"margin-top: -10px;display: block;\"/></div>\n                            </a>\n                        </td>\n                    </tr>\n                </table>\n            </td>\n        </tr>\n        <tr>\n            <td colspan=\"2\" style=\"background-image: url('{{this.url}}/images/letsleak_logo_divider.png'); background-repeat: no-repeat; background-position: center;\" height=\"30\"></td>\n        </tr>\n        <tr>\n            <td colspan=\"2\" style=\"font-family: 'Lato', sans-serif;\">\n                <div style=\"font:30px; font-weight:bold; margin:20px auto; width:90%\">how-<span style=\"color:#198ad1;\">d'ye-do!</span></div>\n                <div style=\"line-height:26px; width:90%; margin:10px auto;\">If there is something itching to get out of you, LetsLeak is right here. LetsLeak is a platform where you can confess, gossip and share any high-profile info with <b>no-names-attached</b>.</div>\n                <table cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"margin-top:70px\">\n                    <tr>\n                        <td style=\"padding-left:0px; padding-top: 0px; padding-right: 20px; padding-bottom: 10px;margin-left: 0;margin-top: 0;margin-bottom: 0;margin-right: 0;vertical-align: top;\"><img src=\"{{this.url}}/images/post-icon.jpg\" width=\"80\" height=\"80\" alt=\"Post\"></td>\n                        <td>\n                            <h2 style=\"margin-left:0; margin-top:0;margin-right:0;margin-bottom:0; padding-left:0; padding-top:0; padding-right:0; padding-bottom:0; ;font-weight:bold;\">Post</h2>\n                            <p style=\" ;padding-left:0;padding-top:0;padding-bottom:0;padding-right:0; margin-left:0; margin-right:0; margin-bottom:0; margin-top:0;line-height:22px\">\n                            <p>If there is something you wanna share with no-names attached, LetsLeak right here. May the\n                                world know some gossip, insider high-profile info, guilt or what-so-ever might be on your mind\n                                or rather in your tummy (with the paunch ;))\n                            </p>\n                            </p>\n                            <div style=\"border-bottom:1px solid #cccccc; width:200px; margin-left:auto;margin-right:auto;display:block;margin-top:30px;margin-bottom:30px\"></div>\n                        </td>\n                    </tr>\n                    <tr>\n                        <td style=\"padding-left:0px; padding-top: 0px; padding-right: 20px; padding-bottom: 10px;margin-left: 0;margin-top: 0;margin-bottom: 0;margin-right: 0;vertical-align: top;\"><img src=\"{{this.url}}/images/home-feed-icon.jpg\" width=\"80\" height=\"80\" alt=\"Look\"></td>\n                        <td>\n                            <h2 style=\"margin-left:0; margin-top:0;margin-right:0;margin-bottom:0; padding-left:0; padding-top:0; padding-right:0; padding-bottom:0; ;font-weight:bold;\">Look</h2>\n                            <p style=\" ;padding-left:0;padding-top:0;padding-bottom:0;padding-right:0; margin-left:0; margin-right:0; margin-bottom:0; margin-top:0;line-height:22px\">\n                            <p>You see you are not the only one.</br>\n                                You see,</br>\n                                there are others in the same boat, stories to reveal without the unnecessary hassles.</br>\n                                And you see,</br>\n                                LetsLeak, some are nasty, some fake and some pure divine.\n                            </p>\n                            </p>\n                            <div style=\"border-bottom:1px solid #cccccc; width:200px; margin-left:auto;margin-right:auto;display:block;margin-top:30px;margin-bottom:30px\"></div>\n                        </td>\n                    </tr>\n                    <tr>\n                        <td style=\"padding-left:0px; padding-top: 0px; padding-right: 20px; padding-bottom: 10px;margin-left: 0;margin-top: 0;margin-bottom: 0;margin-right: 0;vertical-align: top;\"><img src=\"{{this.url}}/images/bucket-icon.jpg\" width=\"80\" height=\"80\" alt=\"Save\"></td>\n                        <td>\n                            <h2 style=\"margin-left:0; margin-top:0;margin-right:0;margin-bottom:0; padding-left:0; padding-top:0; padding-right:0; padding-bottom:0; ;font-weight:bold;\">Save</h2>\n                            <p style=\" ;padding-left:0;padding-top:0;padding-bottom:0;padding-right:0; margin-left:0; margin-right:0; margin-bottom:0; margin-top:0;line-height:22px\">\n                            <p>Once bucket-ed, unfold your collectibles one fine day.</br>\n                                Once saved, read your bucket and browse through other's.</br>\n                                Once archived, leave the rest to LetsLeak.\n                            </p>\n                            </p>\n                            <div style=\"border-bottom:1px solid #cccccc; width:200px; margin-left:auto;margin-right:auto;display:block;margin-top:30px;margin-bottom:30px\"></div>\n                        </td>\n                    </tr>\n                    <tr>\n                        <td style=\"padding-left:0px; padding-top: 0px; padding-right: 20px; padding-bottom: 10px;margin-left: 0;margin-top: 0;margin-bottom: 0;margin-right: 0;vertical-align: top;\"><img src=\"{{this.url}}/images/bucket-insight-icon.jpg\" width=\"80\" height=\"80\" alt=\"Read\"></td>\n                        <td>\n                            <h2 style=\"margin-left:0; margin-top:0;margin-right:0;margin-bottom:0; padding-left:0; padding-top:0; padding-right:0; padding-bottom:0; ;font-weight:bold;\">Read</h2>\n                            <p style=\" ;padding-left:0;padding-top:0;padding-bottom:0;padding-right:0; margin-left:0; margin-right:0; margin-bottom:0; margin-top:0;line-height:22px\">\n                            <p>Collect your broodings and safe-keep the flowing inspiration, funk and pun. Do not let them\n                                pass, Bucket them before they vanish! LetsLeak is here.\n                            </p>\n                            </p>\n                        </td>\n                    </tr>\n                </table>\n                <div style=\"line-height:26px; width:90%; margin:30px auto; text-align:center;\"> <a href=\"{{this.url}}\" target=\"_blank\" alt=\"Visit us\" style=\"outline:none; text-decoration:none;\"><img src=\"{{this.url}}/images/letsleak_visit_us.png\" width=\"262\" height=\"56\" alt=\"\"></a> <br>\n                    <img alt=\"Visit us\" src=\"{{this.url}}/images/letsleak_mail_button_shadow.png\" width=\"262\" height=\"22\" alt=\"\">\n                </div>\n                <div style=\"line-height:26px; width:90%; margin:10px auto;\">Cheers!<br>\n                    Team LetsLeak\n                </div>\n                <div style=\"font-size:11px; color:#a6a6a6;padding:10px; margin-bottom:20px; width:90%; margin-left:2%; margin:10px auto\"> PS: We strongly recommend you to visit our <a target=\"_blank\" href=\"{{this.url}}/GroundRules\">Ground Rules</a> and <a target=\"_blank\" href=\"{{this.url}}/FAQs\">FAQs</a>.</div>\n                <hr style=\"border-top:1px solid #b1b1b1; width:95%; margin:10px auto;\"/>\n                <div style=\"font-size:11px; color:#a6a6a6;padding:10px; margin-bottom:20px; width:90%; text-align:center\"> This is a system generated email. Please do not reply to this mail.</div>\n                <!-- <div style=\"margin-bottom:20px; width:90%; text-align:center; font-size:11px; color:#a6a6a6;\">If you are not able to see this mailer, please <a href=\"#\" alt=\"\">click here</a>.</div></td> -->\n        </tr>\n    </table>\n    </body>\n    </html>\n</template>");Handlebars.templates["promo_email"] = function (data, partials) { partials = (partials || {});return template(data || {}, { helpers: OriginalHandlebars.helpers,partials: partials,name: "promo_email"});};

})();