# lazeword Nix 包：构建单文件应用（nodejs + python3 质量门），安装静态产物与零依赖 server。
# 被 flake.nix 的 packages.default 与 nixosModules.lazeword 引用。
{ stdenv, nodejs, python3, lib }:

stdenv.mkDerivation {
  pname = "lazeword";
  version = "0.2.0";

  src = lib.cleanSourceWith {
    src = ./.;
    filter = name: type:
      lib.cleanSourceFilter name type
      && !(lib.hasInfix "/.git" name)
      && !(lib.hasInfix "/.agents" name)
      && !(lib.hasInfix "/.claude" name)
      && !(lib.hasInfix "/.playwright-mcp" name)
      && !(lib.hasInfix "/docs" name)
      && !(lib.hasInfix "/node_modules" name);
  };

  nativeBuildInputs = [ nodejs python3 ]; # check-packs.py 需要 python3

  buildPhase = ''
    runHook preBuild
    npm run build
    npm test
    runHook postBuild
  '';

  installPhase = ''
    runHook preInstall
    mkdir -p $out/share/lazeword
    cp -r app worker server $out/share/lazeword/
    cp package.json $out/share/lazeword/
    runHook postInstall
  '';

  meta = with lib; {
    description = "躺着背单词 lazeword — 学习即仿真，轨迹即日志（离线词汇学习系统）";
    homepage = "https://github.com/xczhanjun/lazeword";
    license = licenses.mit;
    mainProgram = "lazeword";
  };
}
