package com.example.demo.Service;

import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class BlacklistTokenService {
    private final Set<String> blacklist = new HashSet<>();
    public void addToBlacklist(String token){
        blacklist.add(token);
    }

    public boolean isBlacklisted(String token){
        return blacklist.contains(token);
    }
}