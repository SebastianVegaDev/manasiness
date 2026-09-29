import { Module } from '@nestjs/common';

import { ContractExampleController } from './contract-example.controller.js';

@Module({
    controllers: [
        ContractExampleController,
    ],
})
export class ContractsPlatformModule {}