import express, { Router } from "express";
import { remult, UserInfo } from 'remult';
import { AccountManager } from '../AccountManagers/AccountManager.entity';
import { api } from "./api";

export const auth = Router();
auth.use(express.json());
auth.post("/api/signIn", api.withRemult, async (req, res) => {
    const accountManager = await remult.repo(AccountManager).findFirst({
        firstName: req.body.username
    })
    if (accountManager) {
        const user: UserInfo = {
            id: accountManager.id!,
            name: accountManager.firstName + ' ' + accountManager.lastName,
            roles: [],
            avatar: accountManager.avatar
        };
        req.session!['user'] = user;
        res.json(user);
    }
    else {
        res.status(404).json("Invalid User, Try: " + await AccountManager.getValidUserName());
    }
});

auth.post("/api/signOut", (req, res) => {
    req.session!['user'] = null;
    res.json("signed out");
});

auth.get("/api/currentUser", (req, res) =>
    res.json(req.session!['user'])
);