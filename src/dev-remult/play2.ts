import { Contact } from "../Contacts/Contact.entity";
import { specialRepo } from "./relations";

specialRepo(Contact).find({
  with:{}
}).then(x=>x[0].compa)
specialRepo(Contact).relations.tags2()