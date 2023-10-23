#!/bin/bash
export STARKNET_RPC="http://127.0.0.1:5050/"
export STARKNET_ACCOUNT=~/Desktop/cairo-projects/cairo_github_projects/starkli-wallets/my_katana_account_1.json
export STARKNET_KEYSTORE=~/Desktop/cairo-projects/cairo_github_projects/starkli-wallets/my_katana_keystore_1.json

# DIRECTORY="target/dev"

# if [ ! -d "$DIRECTORY" ]; then
#     echo "Directory not found: $DIRECTORY"
#     exit 1
# fi

# JSON_FILE=$(find "$DIRECTORY" -type f -name "*contract_class.json" | head -n 1)

# if [ -z "$JSON_FILE" ]; then
#     echo "No JSON files found in $DIRECTORY"
#     exit 1
# fi

# scarb build

# echo $JSON_FILE
# declare_output=$(starkli declare "$JSON_FILE")

# echo $declare_output

# last_hash=$(echo "$declare_output" | grep -o '0x[0-9a-f]\+' | awk 'END{print}')
# echo $last_hash

# if [ -z "$last_hash" ]; then
#     echo "Failed to extract the last hash from the 'starkli declare' output."
#     exit 1
# fi


# deploy_output=$(starkli deploy $last_hash)

# echo $deploy_output