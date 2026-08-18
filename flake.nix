{
  description = "lazeword — 躺着背单词：学习即仿真，轨迹即日志（确定性部署见 docs/deployment.md）";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.11";
  };

  outputs = { self, nixpkgs }: let
    forAllSystems = fn: nixpkgs.lib.genAttrs [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ]
      (system: fn (import nixpkgs { inherit system; }));
  in {
    packages = forAllSystems (pkgs: {
      default = pkgs.callPackage ./default.nix {};
    });

    devShells = forAllSystems (pkgs: {
      default = pkgs.mkShell {
        packages = [ pkgs.nodejs_24 pkgs.python3 ];
        shellHook = ''
          echo "lazeword dev shell — npm test && npm run build"
        '';
      };
    });

    # NixOS 模块：systemd 服务跑零依赖 server（静态 app + /api/*）
    nixosModules.lazeword = { config, lib, pkgs, ... }: let
      cfg = config.services.lazeword;
      lazeword = self.packages.${pkgs.system}.default;
    in {
      options.services.lazeword = {
        enable = lib.mkEnableOption "lazeword (躺着背单词)";
        port = lib.mkOption { type = lib.types.port; default = 8000; };
        host = lib.mkOption { type = lib.types.str; default = "0.0.0.0"; };
        deepseekApiKeyFile = lib.mkOption {
          type = lib.types.nullOr lib.types.path;
          default = null;
          description = "可选：含 DEEPSEEK_API_KEY 的文件（缺省时 AI 端点降级）";
        };
        openFirewall = lib.mkOption { type = lib.types.bool; default = false; };
      };

      config = lib.mkIf cfg.enable {
        systemd.services.lazeword = {
          description = "lazeword — 躺着背单词";
          wantedBy = [ "multi-user.target" ];
          after = [ "network.target" ];
          serviceConfig = {
            ExecStart = "${pkgs.nodejs_24}/bin/node ${lazeword}/share/lazeword/server/index.mjs";
            WorkingDirectory = "${lazeword}/share/lazeword";
            Environment = [
              "PORT=${toString cfg.port}"
              "HOST=${cfg.host}"
              "NODE_ENV=production"
            ];
            EnvironmentFile = lib.optionals (cfg.deepseekApiKeyFile != null) [ cfg.deepseekApiKeyFile ];
            DynamicUser = true;
            ProtectSystem = "strict";
            ReadOnlyPaths = [ lazeword ];
            ProtectHome = true;
            NoNewPrivileges = true;
            Restart = "on-failure";
          };
        };
        networking.firewall.allowedTCPPorts = lib.mkIf cfg.openFirewall [ cfg.port ];
      };
    };
  };
}
